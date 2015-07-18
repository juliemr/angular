angular2_test contains helpers to run unit tests against angular2
components and injectables, backed by the `dart:test` library.

At the moment, this shows an example of a test without the helpers - `dart_test.dart`,
and a test with the helpers - `dart_test_with_lib.dart`.

To run, you must have run `gulp build.dart` or have a compiled version of
angular2 in dart linked in some other way. Then:

```
cd modules_dart/angular2_test
pub get
pub run test test/dart_test.dart -p dartium
pub run test test/dart_test_with_lib.dart -p dartium

```

Run compiled with

```
pub run test test/dart_test.dart -p chrome
pub run test test/dart_test_with_lib.dart -p chrome
```
