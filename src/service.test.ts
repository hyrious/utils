import { createDecorator, IService, services } from './service';

const IFoo = createDecorator<IFoo>('foo');
interface IFoo extends IService {
  foo(): void;
}

const IMissing = createDecorator<IService>('missing');

services.register(IFoo, class implements IFoo {
  readonly _isService: undefined;
  constructor() {
    console.log('new Foo()');
  }
  foo() {}
});

class Bar {
  constructor(readonly data: string, @IFoo foo: IFoo, @IMissing _missing: IService) {
    console.log('new Bar()');
  }
}

console.log(services.initialize(Bar, 'bar'));
