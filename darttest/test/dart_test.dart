@TestOn("browser")
import "package:test/test.dart";
import "package:angular2/angular2.dart" show Component, View, NgFor, Injector, Key;
import "package:angular2/test.dart"
    show TestComponentBuilder, inject, createTestInjector;
import 'package:angular2/src/dom/browser_adapter.dart'; // for BrowserDomAdapter
import 'package:angular2/src/render/xhr.dart' show XHR;
import 'package:angular2/src/reflection/reflection.dart'; // for reflector
import 'package:angular2/src/reflection/reflection_capabilities.dart'; // For ReflectionCapabilities

@Component(selector: 'test-cmp')
@View(directives: const [NgFor])
class TestComponent {
  List<num> items;
  TestComponent() {
    this.items = [1, 2];
  }
}

void main() {
  test("String.split() splits the string on the delimiter", () {
    var string = "foo,bar,baz";
    expect(string.split(","), equals(["foo", "bar", "baz"]));
  });

  // test("String.trim() removes surrounding whitespace SHOULD FAIL", () {
  //   var string = "  foo ";
  //   expect(string.trim(), equals("fooXX"));
  // });

  test("should reflect initial elements", () {
    BrowserDomAdapter.makeCurrent();
    reflector.reflectionCapabilities = new ReflectionCapabilities();

    Injector testInjector = createTestInjector([]);

    print("in the test, identityHashCode(Injector):");
    print(identityHashCode(Injector));
    print("in the test, Key.get(Injector).id:");
    print(Key.get(Injector).id);
    
    var i = testInjector.get(Injector);

    print(i);
  });
}
