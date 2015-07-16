// Because Angular is using dart:html, we need these tests to run on an actual
// browser. This means that it should be run with `-p dartium` or `-p chrome`.
@TestOn("browser")

import "package:angular2/angular2.dart"
    show Component, View, NgFor, Injector, Injectable;

import 'package:angular2/src/core/dom/browser_adapter.dart';
import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/core/reflection/reflection_capabilities.dart';

import 'package:angular2/src/testing/test_component_builder.dart';
import 'package:angular2/src/testing/test_injector.dart';

import "package:test/test.dart";


// This is the component we will be testing.
@Component(selector: 'test-cmp')
@View(directives: const [NgFor])
class TestComponent {
  List<num> items;
  TestComponent() {
    this.items = [1, 2];
  }
}

// // We will also test that this service can be added to the test Injector
// // and manipulated during setUp.
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
  Injector testInjector;

  setUp(() {
    BrowserDomAdapter.makeCurrent();
    reflector.reflectionCapabilities = new ReflectionCapabilities();

    testInjector = createTestInjector([TestService]);

    inject([TestService], (service) {
      service.init();
    }).execute(testInjector);
  });

  test("should create a component using the TestComponentBuilder", () async {
    await inject([TestComponentBuilder], (TestComponentBuilder tcb) async {
      var rootTC = await tcb
          .overrideTemplate(TestComponent, TEMPLATE)
          .createAsync(TestComponent);

      rootTC.detectChanges();
      expect(rootTC.debugElement.nativeElement.text, equals("1;2;"));
    }).execute(testInjector);
  });

  test("should reflect added elements", () async {
    await inject([TestComponentBuilder], (TestComponentBuilder tcb) async {
      var rootTC = await tcb
          .overrideTemplate(TestComponent, TEMPLATE)
          .createAsync(TestComponent);

      rootTC.detectChanges();
      ((rootTC.debugElement.componentInstance.items as List<num>)).add(3);
      rootTC.detectChanges();
      expect(rootTC.debugElement.nativeElement.text, equals("1;2;3;"));
    }).execute(testInjector);
  });

  test("should use the service providers from setUp", () async {
    await inject([TestService], (TestService service) {
      expect(service.status, equals('ready'));
    }).execute(testInjector);
  });
}
