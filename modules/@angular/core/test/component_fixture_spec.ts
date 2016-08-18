/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, Input} from '@angular/core';
import {ComponentFixtureAutoDetect, ComponentFixtureNoNgZone, TestBed, async, withModule} from '@angular/core/testing';
import {dispatchEvent} from '@angular/platform-browser/testing/browser_util';
import {expect} from '@angular/platform-browser/testing/matchers';

@Component({selector: 'async-comp', template: `<span (click)='click()'>{{text}}</span>`})
class AsyncComp {
  text: string = '1';

  click() {
    // It passes if this is a timeout instead of a microtask.
    Promise.resolve(null).then((_) => { this.text = '2'; });
  }
}

export function main() {
  describe('ComponentFixture', () => {
    // Fails if the setup is done in an async zone.

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [AsyncComp]
      });
    }));

    // This one passes.

    // beforeEach(() => {
    //   TestBed.configureTestingModule({
    //     declarations: [AsyncComp]
    //   });
    // });


    it('should signal through whenStable when the fixture is stable (autoDetectChanges)',
       async(() => {
         let componentFixture = TestBed.createComponent(AsyncComp);
         componentFixture.detectChanges();

         expect(componentFixture.nativeElement).toHaveText('1');

         let element = componentFixture.debugElement.children[0];
         dispatchEvent(element.nativeElement, 'click');

         // THE ISSUE:
         // The microtasks scheduled in the element's click handler are called RIGHT HERE synchronously.

         expect(componentFixture.nativeElement).toHaveText('1');

         // Component is updated asynchronously. Wait for the fixture to become stable
         // before checking for new value.
         expect(componentFixture.isStable()).toBe(false);

         componentFixture.whenStable().then((waited) => {
           expect(waited).toBe(true);
           componentFixture.detectChanges();

           expect(componentFixture.nativeElement).toHaveText('2');
         });
       }));

  });
}
