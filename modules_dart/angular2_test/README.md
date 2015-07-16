angular2_test contains helpers to run unit tests against angular2
components and injectables, backed by the `dart:test`
[library](https://pub.dartlang.org/packages/test).

Examples
--------

The examples directory contains a component test written with and without
the `angular2_test` helper.

To run, you must have run `gulp build.dart` or have a compiled version of
angular2 in dart linked in some other way. Then:

```
cd modules_dart/angular2_test
pub get
pub run test example -p dartium
```

Run compiled with

```
pub run test example -p chrome
```
