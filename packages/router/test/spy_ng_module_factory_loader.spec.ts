/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {SpyNgModuleFactoryLoader} from '../testing/src/router_testing_module';
import {registerModuleFactory} from '@angular/core/src/linker/ng_module_factory_loader';


describe('SpyNgModuleFactoryLoader', () => {
  it('should invoke the compiler when the setter is called', fakeAsync(() => {
    // const expected = Promise.resolve('returned');
    const expected = 'I am a compiled module';
    const compiler: any = {compileModuleAsync: () => {}};
    const metadata: any = {getNgModuleMetadata: () => {}};

    spyOn(compiler, 'compileModuleAsync').and.returnValue(expected);

    const r = new SpyNgModuleFactoryLoader(<any>compiler, metadata);
    r.stubbedModules = {'one': 'someModule'};

    tick();

    expect(compiler.compileModuleAsync).toHaveBeenCalledWith('someModule');
    let module = '';
    r.stubbedModules['one'].then((s: any) => {
      module = s;
    });
    tick();
    expect(module).toBe(expected);
  }));

  it('should return the created promise', fakeAsync(() => {
    const expected = 'I am a compiled module';
    const compiler: any = {compileModuleAsync: () => expected};
    const metadata: any = {getNgModuleMetadata: () => {}};

    const r = new SpyNgModuleFactoryLoader(<any>compiler, metadata);
    r.stubbedModules = {'one': 'someModule'};

    tick();

    let module = '';
    r.stubbedModules['one'].then((s: any) => {
      module = s;
    });
    tick();
    expect(module).toBe(expected);
  }));

  it('should load a module already available as a factory', fakeAsync(() => {
    const expected = 'I am a compiled module';
    const expectedMetadata = {id: 'one'};
    const compiler: any = {compileModuleAsync: () => {}};
    const metadata: any = {getNgModuleMetadata: () => expectedMetadata};

    // Simulate generated code adding a module factory.
    registerModuleFactory('one', <any>expected);

    spyOn(compiler, 'compileModuleAsync');

    const r = new SpyNgModuleFactoryLoader(<any>compiler, metadata);
    r.stubbedModules = {'one': 'someModule'};

    expect(compiler.compileModuleAsync).not.toHaveBeenCalled();

    let module = '';
    r.stubbedModules['one'].then((s: any) => {
      module = s;
    });
    tick();
    expect(module).toBe(expected);
  }));

  it('should return a rejected promise when given an invalid path', fakeAsync(() => {
       const r = new SpyNgModuleFactoryLoader(<any>null, <any>null);

       let error: any = null;
       r.load('two').catch((e: any) => error = e);

       tick();

       expect(error).toEqual(new Error('Cannot find module two'));
     }));
});
