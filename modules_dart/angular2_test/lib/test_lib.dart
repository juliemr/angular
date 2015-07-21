library test_lib.test_lib;

import 'package:angular2/src/dom/browser_adapter.dart' show BrowserDomAdapter;
import 'package:angular2/src/facade/collection.dart' show StringMapWrapper;
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'package:angular2/src/test_lib/test_injector.dart';
import 'package:test/test.dart';

import 'package:test/src/backend/invoker.dart';
import 'package:test/src/backend/live_test.dart';

export 'package:angular2/src/test_lib/test_component_builder.dart';
export 'package:angular2/src/test_lib/test_injector.dart' show inject;

void initAngularTests() {
  BrowserDomAdapter.makeCurrent();
  reflector.reflectionCapabilities = new ReflectionCapabilities();
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
void setUpBindings(BindingListFactory factory) {
  _currentTestBindings.add(factory);
}

void ngSetUp(fn) {
  if (fn is! FunctionWithParamTokens) fn = new FunctionWithParamTokens([], fn);

  _currentTestInjectorSetups.add(fn);
}

void ngTest(String description, fn, {String testOn, Timeout timeout,
    skip, Map<String, dynamic> onPlatform}) {
  test(description, () async {
    try {
      // TODO: maybe special-case this guy so we know it is the actual
      // test function and not just another ngSetUp call if it fails
      ngSetUp(fn);

      var bindings = [];

      for (BindingListFactory factory in _currentTestBindings) {
        // TODO: consider try/catching these and printing out that it was
        // an error during factory construction
        bindings.addAll(await factory());
      }

      var injector = createTestInjector(bindings);

      for (FunctionWithParamTokens func in _currentTestInjectorSetups) {
        // TODO: consider try/catching these and printing out that it was
        // an error during injector setups
        await func.execute(injector);
      }
    } finally {
      // TODO: uh - maybe - should be okay - maybe tearDown?
      _injectorSetupsExpando[_currentTest] = null;
      _listExpando[_currentTest] = null;
    }
  }, testOn: testOn, timeout: timeout, skip: skip, onPlatform: onPlatform);
}

typedef List<dynamic> BindingListFactory();

List<BindingListFactory> get _currentTestBindings {
  var list = _listExpando[_currentTest ];

  if (list == null) {
    list = _listExpando[_currentTest ] = <BindingListFactory>[];
  }

  return list;
}

final _listExpando = new Expando<List<BindingListFactory>>();

List<FunctionWithParamTokens> get _currentTestInjectorSetups{
  var list = _injectorSetupsExpando[_currentTest ];

  if (list == null) {
    list = _injectorSetupsExpando[_currentTest ] = <FunctionWithParamTokens>[];
  }

  return list;
}

final _injectorSetupsExpando = new Expando<List<FunctionWithParamTokens>>();

// TODO: warning - this is not a public API!!!
LiveTest get _currentTest => Invoker.current.liveTest;
