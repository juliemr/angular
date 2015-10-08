import {
  it,
  iit,
  xit,
  describe,
  ddescribe,
  xdescribe,
  expect,
  tick,
  proxy,
  beforeEach,
  dispatchEvent,
  inject,
  beforeEachBindings,
  TestComponentBuilder
} from 'angular2/test';

import {Injectable, NgIf, bind} from 'angular2/core';
import {Directive, Component, View, ViewMetadata} from 'angular2/angular2';

// Services, and components for the tests.

@Component({selector: 'child-comp'})
@View({template: `<span>Original {{childBinding}}</span>`, directives: []})
@Injectable()
class ChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-comp'})
@View({template: `<span>Mock</span>`})
@Injectable()
class MockChildComp {
}

@Component({selector: 'parent-comp'})
@View({template: `Parent(<child-comp></child-comp>)`, directives: [ChildComp]})
@Injectable()
class ParentComp {
}

@Component({selector: 'my-if-comp'})
@View({template: `MyIf(<span *ng-if="showMore">More</span>)`, directives: [NgIf]})
@Injectable()
class MyIfComp {
  showMore: boolean = false;
}

@Component({selector: 'child-child-comp'})
@View({template: `<span>ChildChild</span>`})
@Injectable()
class ChildChildComp {
}

@Component({selector: 'child-comp'})
@View({
  template: `<span>Original {{childBinding}}(<child-child-comp></child-child-comp>)</span>`,
  directives: [ChildChildComp]
})
@Injectable()
class ChildWithChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-child-comp'})
@View({template: `<span>ChildChild Mock</span>`})
@Injectable()
class MockChildChildComp {
}

class FancyService {
  value: string = 'real value';
  getAsyncValue() {
    return Promise.resolve('async value');
  }
}

class MockFancyService extends FancyService {
  value: string = 'mocked out value';
}

@Component({selector: 'my-service-comp', bindings: [FancyService]})
@View({template: `injected value: {{fancyService.value}}`})
class TestBindingsComp {
  constructor(private fancyService: FancyService) {}
}

@Component({selector: 'my-service-comp', viewBindings: [FancyService]})
@View({template: `injected value: {{fancyService.value}}`})
class TestViewBindingsComp {
  constructor(private fancyService: FancyService) {}
}


export function main() {
  describe('angular2 jasmine matchers', () => {
    describe('toHaveCssClass', () => {
      it('should assert that the CSS class is present', () => {
        var el = document.createElement('div');
        el.classList.add('matias');
        expect(el).toHaveCssClass('matias');
      });

      it('should assert that the CSS class is not present', () => {
        var el = document.createElement('div');
        el.classList.add('matias');
        expect(el).not.toHaveCssClass('fatias');
      });
    });
  });

  describe('using the test injector with the inject helper', () => {
    it('should run normal tests', () => {
      expect(true).toEqual(true);
    });

    it('should run normal async tests', (done) => {
      setTimeout(() => {
        expect(true).toEqual(true);
        done();
      }, 0);
    });

    describe('setting up bindings', () => {
      beforeEachBindings(() => [bind(FancyService).toValue(new FancyService())]);

      it('should use set up bindings', inject([FancyService], (service) => {
        expect(service.value).toEqual('real value');
      }));

      it('should wait until returned promises', inject([FancyService], (service) => {
        return service.getAsyncValue().then((value) => {
          expect(value).toEqual('async value');
        });
      }));

      describe('using beforeEach', () => {
        beforeEach(inject([FancyService], (service) => {
          service.value = 'value modified in beforeEach';
        }));

        it('should use modified bindings', inject([FancyService], (service) => {
          expect(service.value).toEqual('value modified in beforeEach');
        }));

        describe('nested beforeEachBindings', () => {
          // Uncomment to see errors.
          // beforeEachBindings(() => [bind(FancyService).toValue(new FancyService())]);

          it('tests nothing', () => {
            expect(true).toEqual(true);
          })
        });
      });

      describe('using async beforeEach', () => {
        beforeEach(inject([FancyService], (service) => {
          return service.getAsyncValue().then((value) => {
            service.value = value;
          });
        }));

        it('should use asynchronously modified value', inject([FancyService], (service) => {
          expect(service.value).toEqual('async value');
        }));
      });
    });
  });

  // TODO - can we do anything about this?
  xdescribe('problem case', () => {
    beforeEachBindings(() => [bind(FancyService).toValue(new FancyService())]);

    it('should fail, but does not because the return was forgotten',
      inject([FancyService], (service) => {
        service.getAsyncValue().then(() => {
          expect(true).toEqual(false);
        });
      }));
  });

  describe('test component builder', function() {
    it('should instantiate a component with valid DOM',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.createAsync(ChildComp).then((rootTestComponent) => {
           rootTestComponent.detectChanges();

           expect(rootTestComponent.debugElement.nativeElement).toHaveText('Original Child');
         });
       }));

    it('should allow changing members of the component',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.createAsync(MyIfComp).then((rootTestComponent) => {
           rootTestComponent.detectChanges();
           expect(rootTestComponent.debugElement.nativeElement).toHaveText('MyIf()');

           rootTestComponent.debugElement.componentInstance.showMore = true;
           rootTestComponent.detectChanges();
           expect(rootTestComponent.debugElement.nativeElement).toHaveText('MyIf(More)');
         });
       }));

    it('should override a template',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideTemplate(MockChildComp, '<span>Mock</span>')
             .createAsync(MockChildComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.debugElement.nativeElement).toHaveText('Mock');

             });
       }));

    it('should override a view',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideView(ChildComp,
                          new ViewMetadata({template: '<span>Modified {{childBinding}}</span>'}))
             .createAsync(ChildComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.debugElement.nativeElement).toHaveText('Modified Child');

             });
       }));

    it('should override component dependencies',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideDirective(ParentComp, ChildComp, MockChildComp)
             .createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.debugElement.nativeElement).toHaveText('Parent(Mock)');

             });
       }));


    it("should override child component's dependencies",
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideDirective(ParentComp, ChildComp, ChildWithChildComp)
             .overrideDirective(ChildWithChildComp, ChildChildComp, MockChildChildComp)
             .createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.debugElement.nativeElement)
                   .toHaveText('Parent(Original Child(ChildChild Mock))');

             });
       }));

    it('should override a binding',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideBindings(TestBindingsComp, [bind(FancyService).toClass(MockFancyService)])
             .createAsync(TestBindingsComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.debugElement.nativeElement)
                   .toHaveText('injected value: mocked out value');
             });
       }));


    it('should override a viewBinding',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideViewBindings(TestViewBindingsComp,
                                  [bind(FancyService).toClass(MockFancyService)])
             .createAsync(TestViewBindingsComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.debugElement.nativeElement)
                   .toHaveText('injected value: mocked out value');
             });
       }));
  });
}
