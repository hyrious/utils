import { IDisposable, isDisposable } from './dispose';

/**
 * Create it with {@link serviceId}.
 */
export interface IServiceIdentifier<T> {
  /**
   * This field does not actually exist. It is only used to distinguish with other types.
   * You should **not** access this field.
   */
  readonly type: T;
}

/**
 * Create a {@link IServiceIdentifier Service Identifier}.
 *
 * Passing the same `id` will return the same object.
 */
export function serviceId<T>(id: string): IServiceIdentifier<T> {
  return Symbol.for(id) as unknown as IServiceIdentifier<T>;
}

/**
 * See {@link https://gameprogrammingpatterns.com/service-locator.html Service Locator}.
 */
export interface IServiceLocator extends IDisposable {
  /**
   * Get the service by its identifier.
   */
  get<T>(id: IServiceIdentifier<T>): T;

  /**
   * Set the service by its identifier.
   * If the service is not found, it will throw an error.
   */
  set<T>(id: IServiceIdentifier<T>, implemention: T): void;

  /**
   * Create a scoped service locator which overrides its parent services.
   */
  derive(): IServiceLocator;

  /**
   * Dispose all services (not including derived ones).
   */
  dispose(): void;
}

export class ServiceLocator implements IServiceLocator {

  private readonly _services = new Map<IServiceIdentifier<any>, any>();

  constructor(private readonly _parent: ServiceLocator | undefined = undefined) {}

  get<T>(id: IServiceIdentifier<T>): T {
    if (this._services.has(id)) {
      return this._services.get(id)!;
    } else if (this._parent) {
      return this._parent.get(id);
    } else {
      throw new Error(`Service not found: ${id}`);
    }
  }

  set<T>(id: IServiceIdentifier<T>, implemention: T): void {
    this._services.set(id, implemention);
  }

  derive(): IServiceLocator {
    return new ServiceLocator(this);
  }

  dispose(): void {
    for (const service of this._services.values()) {
      if (isDisposable(service)) {
        service.dispose();
      }
    }
    this._services.clear();
  }
}

export const services = /*#__PURE__*/ new ServiceLocator();
