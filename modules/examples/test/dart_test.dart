@TestOn("browser")

import "package:test/test.dart"; // Instead, import angular test lib?
// import "../web/src/todo/services/TodoStore.dart"; // You would do something like this to test an actual file.
import "package:angular2/angular2.dart" show Component, View, NgFor, Injector;
import "package:angular2/test.dart" show TestComponentBuilder, inject, createTestInjector;
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

  // test("Todos work", () {
  //   var todo = new Todo(5, 'write a test', false);
  //   expect(todo.title, equals("write a test"));
  // });

  var TEMPLATE =
      "<div><copy-me template=\"ng-for #item of items\">{{item.toString()}};</copy-me></div>";

  test("should reflect initial elements", () {
    BrowserDomAdapter.makeCurrent();
    reflector.reflectionCapabilities = new ReflectionCapabilities();

    Injector testInjector = createTestInjector([]);

    // inject([XHR], (XHR x) {
    //   expect('1', equals('2')); // This works properly
    // }).execute(testInjector);


    var i = Injector.resolveAndCreate([XHR]);
    var x = i.get(XHR);
    var m = i.get(Injector); // This fails. Why does it work normally???
    // var x = testInjector.get(XHR);
    // var i = testInjector.get(Injector);

    // inject([TestComponentBuilder], (TestComponentBuilder tcb) {
    //   expect('a', equals('b'));
    //   // tcb.overrideTemplate(TestComponent, TEMPLATE)
    //   //     .createAsync(TestComponent)
    //   //     .then((rootTC) {
    //   //       rootTC.detectChanges();
    //   //       expect(rootTC.nativeElement.text, equals("1; 2;"));
    //   //     });
    // }).execute(testInjector);
  });
  // test("should reflect added elements", inject([
  //   TestComponentBuilder
  // ], (TestComponentBuilder tcb) {
  //   tcb
  //       .overrideTemplate(TestComponent, TEMPLATE)
  //       .createAsync(TestComponent)
  //       .then((rootTC) {
  //     rootTC.detectChanges();
  //     ((rootTC.componentInstance.items as List<num>)).add(3);
  //     rootTC.detectChanges();
  //     expect(rootTC.nativeElement).toHaveText("1;2;3;");
  //   });
  // }));

}
