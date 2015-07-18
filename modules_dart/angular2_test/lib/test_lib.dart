library test_lib.test_lib;

import 'package:test/test.dart' as dartTest;
export 'package:test/test.dart'
    hide
        setUp,
        test,
        tearDown;

import 'dart:async';

import 'package:angular2/src/dom/dom_adapter.dart' show DOM;
import 'package:angular2/src/dom/browser_adapter.dart' show BrowserDomAdapter;

import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';

import 'package:angular2/src/di/binding.dart' show bind;
import 'package:angular2/src/di/injector.dart' show Injector;
import 'package:angular2/src/facade/collection.dart' show StringMapWrapper;

import 'package:angular2/src/test_lib/test_injector.dart';
export 'package:angular2/src/test_lib/test_injector.dart' show inject;
export 'package:angular2/src/test_lib/test_component_builder.dart';

List _testBindings = [];
Injector _injector;
bool _inIt = false;

void initAngularTests() {
  BrowserDomAdapter.makeCurrent();
  reflector.reflectionCapabilities = new ReflectionCapabilities();

  dartTest.setUp(() {
    _testBindings.clear();
    _injector = createTestInjector(_testBindings);
  });

  dartTest.tearDown(() {
  });
}

/**
 * Allows overriding default bindings defined in test_injector.js.
 *
 * The given function must return a list of DI bindings.
 *
 * Example:
 *
 *   setUpBindings(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
 */
void setUpBindings(Function fn) {
  dartTest.setUp(() {
    var bindings = fn();
    if (bindings != null) _testBindings.addAll(bindings);
  });
}

void setUp(fn) {
  if (fn is! FunctionWithParamTokens) fn = new FunctionWithParamTokens([], fn);
  dartTest.setUp(() {
    fn.execute(_injector);
  });
}

void test(String description, fn, {String testOn, Timeout timeout,
        skip, Map<String, dynamic> onPlatform}) {
  if (fn is! FunctionWithParamTokens) fn = new FunctionWithParamTokens([], fn);
  dartTest.test(description, () {
    return fn.execute(_injector);
  }, testOn: testOn, timeout: timeout,
        skip: skip, onPlatform: onPlatform);
}
