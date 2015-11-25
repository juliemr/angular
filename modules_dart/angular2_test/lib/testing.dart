library testing.testing;

import 'package:angular2/src/core/di/injector.dart' show Injector;
import 'package:angular2/src/core/dom/browser_adapter.dart' show BrowserDomAdapter;
import 'package:angular2/src/facade/collection.dart' show StringMapWrapper;
import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/core/reflection/reflection_capabilities.dart';
import 'package:angular2/src/testing/test_injector.dart';
import 'package:test/test.dart';

import 'package:test/src/backend/invoker.dart';
import 'package:test/src/backend/live_test.dart';

export 'package:angular2/src/testing/test_component_builder.dart';
export 'package:angular2/src/testing/test_injector.dart' show inject;

/**
 * One time initialization that must be done for Angular2 component
 * tests. Call before any test methods.
 *
 * Example:
 *
 *   main() {
 *     initAngularTests();
 *     group(...);
 *   }
 */
void initAngularTests() {
  BrowserDomAdapter.makeCurrent();
  reflector.reflectionCapabilities = new ReflectionCapabilities();
}

/**
 * Allows overriding default bindings defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   setUpProviders(() => [
 *     provide(Compiler, {withClass: MockCompiler}),
 *     provide(SomeToken, {withValue: myValue}),
 *   ]);
 */
void setUpProviders(providerFactory) {
  setUp(() async {
    if (_currentInjector != null) {
      throw 'setUpProviders was called after the injector had ' +
          'been used in a setUp or test block. This invalidates the ' +
          'test injector';
    }
    _currentTestProviders.addAll(await providerFactory());
  });
}


dynamic _runInjectableFunction(fn) {
  var params = reflector.parameters(fn);
  List<dynamic> tokens = <dynamic>[];
  for (var param in params) {
    for (var annotation in param) {
      // TODO - do some basic type checking here. Make sure it's not untyped. Etc.
      tokens.add(annotation);
    }
  }

  if (_currentInjector == null) {
    _currentInjector = createTestInjector(_currentTestProviders);
  }
  var injectFn = new FunctionWithParamTokens(tokens, fn, false);
  return injectFn.execute(_currentInjector);
}

/**
 * Use the test injector to get bindings and run a function.
 *
 * Example:
 *
 *   ngSetUp((SomeToken token) {
 *     token.init();
 *   });
 */
void ngSetUp(fn) {
  setUp(() async {
    await _runInjectableFunction(fn);
  });
}

/**
 * Add a test which can use the test injector.
 *
 * Example:
 *
 *   ngTest("description", (SomeToken token) {
 *     expect(token, equals('expected'));
 *   });
 */
void ngTest(String description, fn,
    {String testOn, Timeout timeout, skip, Map<String, dynamic> onPlatform}) {
  test(description, () async {
    await _runInjectableFunction(fn);
  }, testOn: testOn, timeout: timeout, skip: skip, onPlatform: onPlatform);
}

final _providersExpando = new Expando<List<Provider>>();
final _injectorExpando = new Expando<Injector>();

List<Provider> get _currentTestProviders {
  if (_providersExpando[_currentTest] == null) {
    return _providersExpando[_currentTest] = <Provider>[];
  }
  return _providersExpando[_currentTest];
}
Injector get _currentInjector => _injectorExpando[_currentTest];
void set _currentInjector(Injector newInjector) {
  _injectorExpando[_currentTest] = newInjector;
}

// TODO: warning, the Invoker.current.liveTest is not a settled API and is
// subject to change in future versions of package:test.
LiveTest get _currentTest => Invoker.current.liveTest;
