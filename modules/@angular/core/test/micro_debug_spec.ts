/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, Input} from '@angular/core';
import {ComponentFixtureAutoDetect, ComponentFixtureNoNgZone, TestBed, async, withModule} from '@angular/core/testing';
import {dispatchEvent, el} from '@angular/platform-browser/testing/browser_util';


@Component({selector: 'async-comp', template: `<span (click)='click()'>{{text}}</span>`})
class AsyncComp {
  text: string = '1';

  click() {
    Promise.resolve(null).then((_) => { this.text = '2'; });
  }
}

@Component({selector: 'async-timeout-comp', template: `<span (click)='click()'>{{text}}</span>`})
class AsyncTimeoutComp {
  text: string = '1';

  click() {
    setTimeout(() => { this.text = '2'; }, 10);
  }
}

export function main() {
  describe('ComponentFixture', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [
          AsyncComp, AsyncTimeoutComp
        ]
      });
    }));

    it('should signal through whenStable when the fixture is stable (autoDetectChanges)',
      async(() => {
        let componentFixture = TestBed.createComponent(AsyncTimeoutComp);
        componentFixture.autoDetectChanges();
        expect(componentFixture.nativeElement.innerHTML).toContain('1');

        let element = componentFixture.debugElement.children[0];
        dispatchEvent(element.nativeElement, 'click');
        expect(componentFixture.nativeElement.innerHTML).toContain('1');

        // Component is updated asynchronously. Wait for the fixture to become stable
        // before checking for new value.
        expect(componentFixture.isStable()).toBe(false);
        componentFixture.whenStable().then((waited) => {
          expect(waited).toBe(true);
          expect(componentFixture.nativeElement.innerHTML).toContain('2');
        });
      }));
  });
}
