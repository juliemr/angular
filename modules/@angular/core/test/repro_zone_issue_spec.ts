/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {async} from '@angular/core/testing';

export function main() {
  fdescribe('ComponentFixture', () => {
    beforeEach(async(() => {
      // This can be empty, but it needs to be async().
    }));

    it('should instantiate a component with valid DOM', async(() => {

      // Need to do something that schedules a task here.

      setTimeout(() => {
        console.log('hi');
      }, 10);
    }));

  });
}
