// From https://github.com/microsoft/vscode/blob/main/src/vs/platform/instantiation/common/instantiation.ts

import { isDisposable } from './dispose';

/**
 * Service instance.
 */
export interface IService {
  /** This field does not actually exist. It is here only to distinguish with other types. */
  readonly _isService: undefined;
}

/**
 * The singleton object to identify a {@link IService service}.
 * Create it via `createDecorator('serviceName')`.
 */
export interface IServiceIdentifier<T> {
  /** The identifier is a decorator function. */
  (...args: any[]): void;
  /** This field does not actually exist. It is here only to distinguish with other types. */
  readonly type: T;
}

export interface ServiceAccessor {
  get<T>(id: IServiceIdentifier<T>): T;
}

const DI_TARGET = '$di$target';
const DI_DEPENDENCIES = '$di$dependencies';
function getDependencies(target: Function): { id: IServiceIdentifier<any>, index: number; }[] {
  return target[DI_DEPENDENCIES] || [];
}

const serviceIds = /*#__PURE__*/ new Map<string, IServiceIdentifier<any>>();

/**
 * The only valid way to create a {@link IServiceIdentifier service identifier}.
 * If the name was created before, it returns the same identifier.
 */
export function createDecorator<T extends IService>(serviceId: string): IServiceIdentifier<T> {
  if (serviceIds.has(serviceId)) {
    return serviceIds.get(serviceId)!;
  }

  const id = function (target: Function, _key: string, index: number): void {
    if (arguments.length !== 3) {
      throw new Error('@IServiceName must be used with a parameter.');
    }
    if (target[DI_TARGET] === target) {
      target[DI_DEPENDENCIES].push({ id, index });
    } else {
      target[DI_TARGET] = target;
      target[DI_DEPENDENCIES] = [{ id, index }];
    }
  } as IServiceIdentifier<T>;

  id.toString = () => serviceId;
  serviceIds.set(serviceId, id);
  return id;
}

type LeadingNonServiceArgs<TArgs extends any[]> =
  TArgs extends [] ? []
  : TArgs extends [...infer TFirst, IService] ? LeadingNonServiceArgs<TFirst>
  : TArgs;

/**
 * Registry of services.
 */
export interface IServices {
  /** Register a singleton service's implementation, it will be lazily created when you {@link get} it. */
  register<T, Services extends IService[]>(id: IServiceIdentifier<T>, ctor: new (...services: Services) => T): void;
  /** Get or create a singleton service. */
  get<T>(id: IServiceIdentifier<T>): T;
  /** Set a singleton service. */
  set<T>(id: IServiceIdentifier<T>, service: T): void;
  /** Create (i.e. `new`) something depending on services. */
  initialize<T>(ctor: new () => T): T;
  initialize<Ctor extends new (...args: any[]) => unknown, R extends InstanceType<Ctor>>(ctor: Ctor, ...args: LeadingNonServiceArgs<ConstructorParameters<Ctor>>): R;
  /** Dispose all services instances by calling their `dispose()` method if provided. */
  dispose(): void;
}

export const services: IServices = /*#__PURE__*/ new class implements IServices {
  readonly registry = new Map<IServiceIdentifier<any>, new (...args: any[]) => unknown>();
  readonly services = new Map<IServiceIdentifier<any>, any>();

  register<T, Services extends IService[]>(id: IServiceIdentifier<T>, ctor: new (...services: Services) => T): void {
    this.registry.set(id, ctor);
  }

  get<T>(id: IServiceIdentifier<T>): T {
    if (this.services.has(id)) {
      return this.services.get(id);
    }
    const ctor = this.registry.get(id);
    if (!ctor) {
      throw new Error(`Service '${id}' is not registered.`);
    }
    const service = this.initialize(ctor) as T;
    this.services.set(id, service);
    return service;
  }

  set<T>(id: IServiceIdentifier<T>, service: T): void {
    if (this.services.has(id)) {
      const instance = this.services.get(id);
      if (isDisposable(instance)) {
        instance.dispose();
      }
    }
    this.services.set(id, service);
  }

  initialize<Ctor extends new (...args: any[]) => unknown, R extends InstanceType<Ctor>>(ctor: Ctor, ...args: LeadingNonServiceArgs<ConstructorParameters<Ctor>>): R {
    const serviceDeps = getDependencies(ctor).sort((a, b) => a.index - b.index);
    const serviceArgs: any[] = [];
    for (const dep of serviceDeps) {
      const service = this.getOrCreate(dep.id);
      if (!service) {
        throw new Error(`Service '${dep.id}' is not registered.`);
      }
      serviceArgs.push(service);
    }

    const separator = serviceDeps.length > 0 ? serviceDeps[0].index : args.length;
    if (args.length !== separator) {
      const delta = separator - args.length;
      if (delta > 0) {
        args = args.concat(new Array(delta) as any) as any;
      } else {
        args = args.slice(0, separator) as any;
      }
    }

    return Reflect.construct<any, R>(ctor as new (...args: any) => R, args.concat(serviceArgs as any));
  }

  getOrCreate<T>(id: IServiceIdentifier<T>): T {
    const thing = this.services.get(id) || this.registry.get(id);
    if (thing instanceof Function) {
      return this.safeCreate(id, thing);
    } else {
      return thing;
    }
  }

  readonly tasks = new Set<IServiceIdentifier<any>>();
  safeCreate<T>(id: IServiceIdentifier<T>, ctor: new (...args: any[]) => unknown): T {
    if (this.tasks.has(id)) {
      throw new Error(`Cyclic when initializing ${id}.`);
    }
    this.tasks.add(id);
    try {
      return this.create(id, ctor);
    } finally {
      this.tasks.delete(id);
    }
  }

  create(id: IServiceIdentifier<any>, ctor: new (...args: any[]) => unknown): any {
    interface Item {
      readonly id: IServiceIdentifier<any>;
      readonly ctor: new (...args: any[]) => unknown;
    }
    const graph = new Graph<Item>(e => e.id.toString());

    let count = 0;
    const stack: Item[] = [{ id, ctor }];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const item = stack.pop()!;
      if (seen.has(item.id.toString())) {
        continue;
      }
      seen.add(item.id.toString());
      graph.node(item);

      if (count++ > 1000) {
        throw new Error('Cycle detected.');
      }

      for (const dep of getDependencies(item.ctor)) {
        const desc = this.services.get(dep.id) || this.registry.get(dep.id);
        if (!desc) {
          throw new Error(`Service '${dep.id}' is not registered.`);
        }
        if (desc instanceof Function) {
          const nextItem: Item = { id: dep.id, ctor: desc };
          graph.link(item, nextItem);
          stack.push(nextItem);
        }
      }
    }

    while (true) {
      const roots = graph.roots();
      if (roots.length === 0) {
        if (!graph.empty()) {
          throw new Error('Cycle detected: ' + graph.findCycle());
        }
        break;
      }

      for (const { data } of roots) {
        const desc = this.services.get(data.id) || this.registry.get(data.id);
        if (desc instanceof Function) {
          this.services.set(data.id, this.initialize(desc));
        }
        graph.delete(data);
      }
    }
    return this.services.get(id);
  }

  dispose(): void {
    for (const thing of this.services) {
      if (isDisposable(thing)) {
        thing.dispose();
      }
    }
    this.services.clear();
  }
};

class Graph<T> {
  readonly nodes = new Map<string, Node<T>>();

  constructor(readonly hash: (item: T) => string) {}

  empty(): boolean {
    return this.nodes.size === 0;
  }

  roots(): Node<T>[] {
    const result: Node<T>[] = [];
    for (const node of this.nodes.values()) {
      if (node.outgoing.size === 0) {
        result.push(node);
      }
    }
    return result;
  }

  node(item: T): Node<T> {
    const key = this.hash(item);
    let node = this.nodes.get(key);
    if (node == null) {
      node = new Node<T>(key, item);
      this.nodes.set(key, node);
    }
    return node;
  }

  link(from: T, to: T): void {
    const fromNode = this.node(from), toNode = this.node(to);
    fromNode.outgoing.set(toNode.key, toNode);
    toNode.incoming.set(fromNode.key, fromNode);
  }

  delete(item: T): void {
    const key = this.hash(item);
    this.nodes.delete(key);
    for (const node of this.nodes.values()) {
      node.outgoing.delete(key);
      node.incoming.delete(key);
    }
  }

  findCycle(): string | undefined {
    for (const [id, node] of this.nodes) {
      const seen = new Set<string>([id]);
      const result = this._findCycle(node, seen);
      if (result) {
        return result;
      }
    }
  }

  _findCycle(node: Node<T>, seen: Set<string>): string | undefined {
    for (const [id, outgoing] of node.outgoing) {
      if (seen.has(id)) {
        return [...seen, id].join(' -> ');
      }
      seen.add(id);
      const result = this._findCycle(outgoing, seen);
      if (result) {
        return result;
      }
      seen.delete(id);
    }
  }
}

class Node<T> {
  readonly incoming = new Map<string, Node<T>>();
  readonly outgoing = new Map<string, Node<T>>();

  constructor(readonly key: string, readonly data: T) {}
}
