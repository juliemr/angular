// Because Angular is using dart:html, we need these tests to run on an actual
// browser. This means that it should be run with `-p dartium` or `-p chrome`.
@TestOn("browser")
import "package:angular2/angular2.dart"
    show Component, View, NgFor, Injectable;

import 'package:test/test.dart';
import "package:angular2_test/testing.dart";

// This is the component we will be testing.
@Component(selector: 'test-cmp')
@View(directives: const [NgFor])
class TestComponent {
  List<num> items;
  TestComponent() {
    this.items = [1, 2];
  }
}

// We will also test that this service can be added to the test Injector
// and manipulated during setUp.
@Injectable()
class TestService {
  String status = "not ready";

  init() {
    this.status = "ready";
  }
}

const TEMPLATE =
    "<div><copy-me template=\"ng-for #item of items\">{{item.toString()}};</copy-me></div>";

void main() {
  initAngularTests();

  setUpProviders(() => [TestService]);

  ngSetUp([TestService], (TestService service) {
    service.init();
  });

  ngTest("should create a component using the TestComponentBuilder", [TestComponentBuilder],
      (TestComponentBuilder tcb) async {
    var fixture = await tcb
        .overrideTemplate(TestComponent, TEMPLATE)
        .createAsync(TestComponent);

    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.text, equals("1;2;"));
  });

  ngTest("should reflect added elements", [TestComponentBuilder],
      (TestComponentBuilder tcb) async {
    var fixture = await tcb
        .overrideTemplate(TestComponent, TEMPLATE)
        .createAsync(TestComponent);

    fixture.detectChanges();
    ((fixture.debugElement.componentInstance.items as List<num>)).add(3);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.text, equals("1;2;3;"));
  });

  ngTest("should use the service providers from ngSetUp", [TestService],
      (TestService service) async {
    expect(service.status, equals('ready'));
  });

  // This would fail, since setUpProviders is used after a call to ngSetUp has already
  // initialized the injector.
  // group("nested", () {
  //   setUpProviders(() => [TestService]);

  //   test("foo", () {
  //     expect(1 + 1, equals(2));
  //   });
  // });
}
