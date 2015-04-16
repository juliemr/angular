import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit,
} from 'angular2/test_lib';
import {appDocumentToken, appElementToken} from 'angular2/src/core/application_tokens';
import {Testability} from 'angular2/src/core/testability/testability';
import {bootstrap} from 'angular2/src/core/application';
import {Component, Decorator} from 'angular2/src/core/annotations/annotations';

@Component({selector: 'hello-app'})
@Template({inline: '{{bindinga}} {{bindingb}}'})
class HelloRootCmp {
  bindinga: string;
  bindingb: string;

  constructor() {
    this.bindinga = 'hello';
    this.bindingb = 'world';
  }
}

export function main() {
  ddescribe('Testability', () => {
    var fakeDoc, el, testBindings;
    var testability, executed;

    beforeEach(() => {
      fakeDoc = DOM.createHtmlDocument();
      el = DOM.createElement('hello-app', fakeDoc);
      lightDom = DOM.createElement('light-dom-el', fakeDoc);
      DOM.appendChild(fakeDoc.body, el);
      DOM.appendChild(el, lightDom);
      DOM.setText(lightDom, 'loading');
      testBindings = [bind(appDocumentToken).toValue(fakeDoc)];

      testability = new Testability();
      executed = false;
    });

    describe('findBindings', () => {
      it('should resolve an injector promise and contain bindings', inject([AsyncTestCompleter], (async) => {
        var injectorPromise = bootstrap(HelloRootCmp, testBindings);
        injectorPromise.then((injector) => {
          expect(injector.get(appElementToken)).toBe(el);
          async.done();
        });
      }));
    });

    it('should start with a pending count of 0', () => {
      expect(testability.getPendingCount()).toEqual(0);
    });

    it('should fire whenstable callbacks if pending count is 0', () => {
      testability.whenStable(() => executed = true);
      expect(executed).toBe(true);
    });

    it('should not call whenstable callbacks when there are pending counts', () => {
      testability.increaseCount(2);
      testability.whenStable(() => executed = true);

      expect(executed).toBe(false);
      testability.increaseCount(-1);
      expect(executed).toBe(false);
    });

    it('should fire whenstable callbacks when pending drops to 0', () => {
      testability.increaseCount(2);
      testability.whenStable(() => executed = true);

      expect(executed).toBe(false);

      testability.increaseCount(-2);
      expect(executed).toBe(true);
    });
  });
}
