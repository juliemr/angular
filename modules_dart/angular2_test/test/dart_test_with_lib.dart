// Because Angular is using dart:html, we need these tests to run on an actual
// browser. This means that it should be run with `-p dartium` or `-p chrome`.
@TestOn("browser")
import "package:angular2/angular2.dart"
    show Component, View, NgFor, Injector, Key;

import 'package:test/test.dart';
import "package:angular2_test/test_lib.dart";

// This is the component we will be testing.
@Component(selector: 'test-cmp')
@View(directives: const [NgFor])
class TestComponent {
  List<num> items;
  TestComponent() {
    this.items = [1, 2];
  }
}

const TEMPLATE =
    "<div><copy-me template=\"ng-for #item of items\">{{item.toString()}};</copy-me></div>";

void main() {
  initAngularTests();

  test("normal function", () {
    var string = "foo,bar,baz";
    expect(string.split(","), equals(["foo", "bar", "baz"]));
  });

  ngTest("create a component using the TCB", inject([TestComponentBuilder],
      (TestComponentBuilder tcb) async {
    var rootTC = await tcb
        .overrideTemplate(TestComponent, TEMPLATE)
        .createAsync(TestComponent);

    rootTC.detectChanges();
    expect(rootTC.nativeElement.text, equals("1;2;"));
  }));

  ngTest("should reflect added elements", inject([TestComponentBuilder],
      (TestComponentBuilder tcb) async {
    var rootTC = await tcb
        .overrideTemplate(TestComponent, TEMPLATE)
        .createAsync(TestComponent);

    rootTC.detectChanges();
    ((rootTC.componentInstance.items as List<num>)).add(3);
    rootTC.detectChanges();

    expect(rootTC.nativeElement.text, equals("1;2;3;"));
  }));
}
