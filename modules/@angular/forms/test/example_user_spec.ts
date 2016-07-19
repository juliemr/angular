import {async, fakeAsync, inject, TestComponentBuilder, configureModule} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

import {FormsModule} from '@angular/forms';

@Component({
  selector: 'my-component',
  template: `
    <span>Favorite vegetable</span>
    <input type="text" [(ngModel)]="veggie"/>
  `
})
class MyComponent {
  veggie: string = 'agurula';
}

export function main() {

  fdescribe('The way a user would test a component using forms', () => {
    let builder:TestComponentBuilder;

    beforeEach(() => {
      configureModule({
        modules: [FormsModule]
      });
    });

    beforeEach(inject([TestComponentBuilder], (tcb:TestComponentBuilder) => {
      builder = tcb;
    }));

    // This is the only way that actually works.
    it('should work with async and triggering change detection dispatching event', async(() => {
      let fixture = builder.createSync(MyComponent);

      let comp = fixture.componentInstance;
      let input = fixture.debugElement.query(By.css('input')).nativeElement;

      printStuff(1, comp, input);

      // We need to run change detection, THEN whenStable.
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        printStuff(2, comp, input);

        comp.veggie = 'brocollini';
        console.log('SET comp.veggie = brocollini');

        printStuff(3, comp, input);

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          printStuff(4, comp, input);

          input.value = 'chard';
          console.log('SET input.value = chard');

          printStuff(5, comp, input);

          // ... and dispatching an event is the only way to get data from DOM back to component.
          input.dispatchEvent(new Event('input'));
          printStuff(6, comp, input);
        });
      });
    }));

    // This one doesn't work - it falls apart at step 4, when they should both be B.
    it('should work with async and triggering change detection dispatching event autodetect', async(() => {
      let fixture = builder.createSync(MyComponent);
      fixture.autoDetectChanges();

      let comp = fixture.componentInstance;
      let input = fixture.debugElement.query(By.css('input')).nativeElement;

      printStuff(1, comp, input);

      fixture.whenStable().then(() => {
        printStuff(2, comp, input);

        comp.veggie = 'brocollini';
        console.log('SET comp.veggie = brocollini');

        printStuff(3, comp, input);

        fixture.whenStable().then(() => {
          printStuff(4, comp, input);

          input.value = 'chard';
          console.log('SET input.value = chard');

          printStuff(5, comp, input);

          // ... and dispatching an event is the only way to get data from DOM back to component.
          input.dispatchEvent(new Event('input'));
          printStuff(6, comp, input);
        });
      });
    }));

    // If this worked, I would be content. It would be _ideal_ if we didn't have the async stuff at all.
    it('would be great if this one worked.', async(() => {
      let fixture = builder.createSync(MyComponent);
      fixture.autoDetectChanges();

      let comp = fixture.componentInstance;
      let input = fixture.debugElement.query(By.css('input')).nativeElement;

      printStuff(1, comp, input);

      fixture.whenStable().then(() => {
        printStuff(2, comp, input);

        comp.veggie = 'brocollini';
        console.log('SET comp.veggie = brocollini');

        printStuff(3, comp, input);

        fixture.whenStable().then(() => {
          printStuff(4, comp, input);

          input.value = 'chard';
          console.log('SET input.value = chard');

          printStuff(5, comp, input);

          fixture.whenStable().then(() => {
            printStuff(6, comp, input);
          });
        });
      });
    }));
  });

  function printStuff(prefix:number|string, comp:MyComponent, input:any) {
    console.log('-- ' + prefix);
    console.log('component veggie: ' + comp.veggie);
    console.log('input value: ' + input.value);
  }
}
