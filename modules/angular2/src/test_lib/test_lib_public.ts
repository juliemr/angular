/// <reference path="../../typings/jasmine/jasmine.d.ts"/>


/**
 * Public Test Library for unit testing Angular2 Applications. Uses the
 * Jasmine framework.
 */
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {global, isFunction, isPromise, Math} from 'angular2/src/core/facade/lang';
import {NgZoneZone} from 'angular2/src/core/zone/ng_zone';

import {bind} from 'angular2/src/core/di';

import {createTestInjector, FunctionWithParamTokens, inject} from './test_injector';
import {browserDetection} from './utils';

export {inject} from './test_injector';

export var proxy: ClassDecorator = (t) => t;

var _global: jasmine.GlobalPolluter = <any>(typeof window === 'undefined' ? global : window);

export var afterEach: Function = _global.afterEach;

export type SyncTestFn = () => void;
export type AsyncTestFn = (done: () => void) => void;
export type AnyTestFn = SyncTestFn | AsyncTestFn;

export interface NgMatchers extends jasmine.Matchers {
  toBe(expected: any): boolean;
  toEqual(expected: any): boolean;
  toBePromise(): boolean;
  toBeAnInstanceOf(expected: any): boolean;
  toHaveText(expected: any): boolean;
  toHaveCssClass(expected: any): boolean;
  toImplement(expected: any): boolean;
  toContainError(expected: any): boolean;
  toThrowErrorWith(expectedMessage: any): boolean;
  not: NgMatchers;
}

export var expect: (actual: any) => NgMatchers = <any>_global.expect;

export class AsyncTestCompleter {
  constructor(private _done: Function) {}

  done(): void { this._done(); }
}

var jsmBeforeEach = _global.beforeEach;
var jsmDescribe = _global.describe;
var jsmDDescribe = _global.fdescribe;
var jsmXDescribe = _global.xdescribe;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;

var globalTimeOut = browserDetection.isSlow ? 3000 : jasmine.DEFAULT_TIMEOUT_INTERVAL;

var testBindings;
var injector;

// Reset the test bindings before each test
jsmBeforeEach(() => {
  testBindings = [];
  injector = null;
});

export var describe: Function = jsmDescribe;
export var ddescribe: Function = jsmDDescribe;
export var xdescribe: Function = jsmXDescribe;

/**
 * Allows overriding default bindings defined in test_injector.js.
 *
 * The given function must return a list of DI bindings.
 *
 * Example:
 *
 *   beforeEachBindings(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
 */
export function beforeEachBindings(fn): void {
  jsmBeforeEach(() => {
    var bindings = fn();
    if (!bindings) return;
    testBindings = [...testBindings, ...bindings];
    if (injector !== null) {
      throw new Error('beforeEachBindings was called after the injector had ' +
          'been used in a beforeEach or it block. This invalidates the ' +
          'test injector');
    }
  });
}

function _it(jsmFn: Function, name: string, testFn: FunctionWithParamTokens | AnyTestFn,
             testTimeOut: number): void {
  var timeOut = Math.max(globalTimeOut, testTimeOut);

  if (testFn instanceof FunctionWithParamTokens) {
    // The test case uses inject(). ie `it('test', inject([ClassA], (a) => { ...
    // }));`
    jsmFn(name, (done) => {
      if (!injector) {
        injector = createTestInjector(testBindings);
      }
      var returned = testFn.execute(injector);
      if (isPromise(returned)) {
        returned.then(done, done.fail);
      } else {
        done();
      }
    }, timeOut);
  } else {
    // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`
    if ((<any>testFn).length === 0) {
      jsmFn(name, () => {
        (<SyncTestFn>testFn)();
      }, timeOut);
    } else {
      jsmFn(name, (done) => {
        (<AsyncTestFn>testFn)(done);
      }, timeOut);
    }
  }
}


export function beforeEach(fn: FunctionWithParamTokens | AnyTestFn): void {
  if (fn instanceof FunctionWithParamTokens) {
    // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
    // }));`

    jsmBeforeEach((done) => {
      if (!injector) {
        injector = createTestInjector(testBindings);
      }
      var returned = fn.execute(injector);
      if (isPromise(returned)) {
        returned.then(done, done.fail);
      } else {
        done();
      }
    });
  } else {
    // The test case doesn't use inject(). ie `beforeEach((done) => { ... }));`

    if ((<any>fn).length === 0) {
      jsmBeforeEach(() => {
        (<SyncTestFn>fn)();
      });
    } else {
      jsmBeforeEach((done) => {
        (<AsyncTestFn>fn)(done);
      });
    }
  }
}

export function it(name, fn, timeOut = null): void {
  return _it(jsmIt, name, fn, timeOut);
}

export function xit(name, fn, timeOut = null): void {
  return _it(jsmXIt, name, fn, timeOut);
}

export function iit(name, fn, timeOut = null): void {
  return _it(jsmIIt, name, fn, timeOut);
}

// Some Map polyfills don't polyfill Map.toString correctly, which
// gives us bad error messages in tests.
// The only way to do this in Jasmine is to monkey patch a method
// to the object :-(
Map.prototype['jasmineToString'] = function() {
  var m = this;
  if (!m) {
    return '' + m;
  }
  var res = [];
  m.forEach((v, k) => { res.push(`${k}:${v}`); });
  return `{ ${res.join(',')} }`;
};

_global.beforeEach(function() {
  jasmine.addMatchers({
    toBePromise: function() {
      return {
        compare: function(actual, expectedClass) {
          var pass = typeof actual === 'object' && typeof actual.then === 'function';
          return {pass: pass, get message() { return 'Expected ' + actual + ' to be a promise'; }};
        }
      };
    },

    toBeAnInstanceOf: function() {
      return {
        compare: function(actual, expectedClass) {
          var pass = typeof actual === 'object' && actual instanceof expectedClass;
          return {
            pass: pass,
            get message() {
              return 'Expected ' + actual + ' to be an instance of ' + expectedClass;
            }
          };
        }
      };
    },

    toHaveText: function() {
      return {
        compare: function(actual, expectedText) {
          var actualText = elementText(actual);
          return {
            pass: actualText == expectedText,
            get message() { return 'Expected ' + actualText + ' to be equal to ' + expectedText; }
          };
        }
      };
    },

    toHaveCssClass: function() {
      return {compare: buildError(false), negativeCompare: buildError(true)};

      function buildError(isNot) {
        return function(actual, className) {
          return {
            pass: DOM.hasClass(actual, className) == !isNot,
            get message() {
              return `Expected ${actual.outerHTML} ${isNot ? 'not ' : ''}to contain the CSS class "${className}"`;
            }
          };
        };
      }
    },

    toContainError: function() {
      return {
        compare: function(actual, expectedText) {
          var errorMessage = actual.toString();
          return {
            pass: errorMessage.indexOf(expectedText) > -1,
            get message() { return 'Expected ' + errorMessage + ' to contain ' + expectedText; }
          };
        }
      };
    },

    toThrowErrorWith: function() {
      return {
        compare: function(actual, expectedText) {
          try {
            actual();
            return {
              pass: false,
              get message() { return "Was expected to throw, but did not throw"; }
            };
          } catch (e) {
            var errorMessage = e.toString();
            return {
              pass: errorMessage.indexOf(expectedText) > -1,
              get message() { return 'Expected ' + errorMessage + ' to contain ' + expectedText; }
            };
          }
        }
      };
    },

    toImplement: function() {
      return {
        compare: function(actualObject, expectedInterface) {
          var objProps = Object.keys(actualObject.constructor.prototype);
          var intProps = Object.keys(expectedInterface.prototype);

          var missedMethods = [];
          intProps.forEach((k) => {
            if (!actualObject.constructor.prototype[k]) missedMethods.push(k);
          });

          return {
            pass: missedMethods.length == 0,
            get message() {
              return 'Expected ' + actualObject + ' to have the following methods: ' +
                     missedMethods.join(", ");
            }
          };
        }
      };
    }
  });
});

function elementText(n) {
  var hasNodes = (n) => {
    var children = DOM.childNodes(n);
    return children && children.length > 0;
  };

  if (n instanceof Array) {
    return n.map((nn) => elementText(nn)).join("");
  }

  if (DOM.isCommentNode(n)) {
    return '';
  }

  if (DOM.isElementNode(n) && DOM.tagName(n) == 'CONTENT') {
    return elementText(Array.prototype.slice.apply(DOM.getDistributedNodes(n)));
  }

  if (DOM.hasShadowRoot(n)) {
    return elementText(DOM.childNodesAsList(DOM.getShadowRoot(n)));
  }

  if (hasNodes(n)) {
    return elementText(DOM.childNodesAsList(n));
  }

  return DOM.getText(n);
}
