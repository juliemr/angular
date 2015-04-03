import {Injectable} from 'angular2/di';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {View, DirectiveBindingMemento, ElementBindingMemento} from 'angular2/src/core/compiler/view';
import {StringWrapper, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as getTestabilityModule from 'angular2/src/core/testability/get_testability';


/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
@Injectable()
export class Testability {
  _pendingCount: number;
  _callbacks: List;
  _rootView: View;
  _bindingMap: Map;

  constructor(rootView: View) {
    this._pendingCount = 0;
    this._callbacks = ListWrapper.create();
    this._rootView = rootView;
  }

  increaseCount(delta: number = 1) {
    this._pendingCount += delta;
    if (this._pendingCount < 0) {
      throw new BaseException('pending async requests below zero');
    } else if (this._pendingCount == 0) {
      this._runCallbacks();
    }
    return this._pendingCount;
  }

  _runCallbacks() {
    while (this._callbacks.length !== 0) {
      ListWrapper.removeLast(this._callbacks)();
    }
  }

  whenStable(callback: Function) {
    ListWrapper.push(this._callbacks, callback);

    if (this._pendingCount === 0) {
      this._runCallbacks();
    }
    // TODO(juliemr) - hook into the zone api.
  }

  getPendingCount(): number {
    return this._pendingCount;
  }

  _addBindingsFromView(view: View) {
    // TODO - this (maybe? maybe not?) won't work for the JIT change detector
    // TODO - figure out how to switch to the JIT change detector
    var protos = view.changeDetector.protos; // These are ProtoRecords
    for (var i = 0; i < protos.length; ++i) {
      var memento = protos[i].bindingMemento;
      var elem = null;
      if (memento instanceof DirectiveBindingMemento) {
        // TODO - figure out what this case is.
        continue;
      } else if (memento instanceof ElementBindingMemento) {
        // TODO - can we do this without accessing the private variable?
        // This will (probably?) fail in dart.
        elem = view.bindElements[memento._elementIndex];
      } else {
        // memento is an integer index into textNodes.
        elem = view.textNodes[memento].parentElement;
      }

      var bindingName = protos[i].name;
      if (bindingName == 'interpolate') {
        continue;
      }
      if (!MapWrapper.contains(this._bindingMap, bindingName)) {
        MapWrapper.set(this._bindingMap, bindingName, [elem]);
      } else {
        ListWrapper.push(MapWrapper.get(this._bindingMap, bindingName), elem);
      }
    }

    for (var j = 0; j < view.componentChildViews.length; ++j) {
      this._addBindingsFromView(view.componentChildViews[j]);
      // TODO - and also add view containers here?
    }
  }

  findBindings(using, binding: string, exactMatch: boolean): List {
    // TODO(juliemr): implement.
    console.log(this._rootView);

    this._bindingMap = MapWrapper.create();
    this._addBindingsFromView(this._rootView);

    if (exactMatch) {
      return MapWrapper.get(this._bindingMap, binding);
    } else {
      var matches = ListWrapper.create();
      MapWrapper.forEach(this._bindingMap, (elems, name) => {
        if (StringWrapper.contains(name, binding)) {
          matches = ListWrapper.concat(matches, elems);
        }
      });
      return matches;
    }
  }
}

@Injectable()
export class TestabilityRegistry {
  _applications: Map;

  constructor() {
    this._applications = MapWrapper.create();

    getTestabilityModule.GetTestability.addToWindow(this);
  }

  registerApplication(token, testability: Testability) {
    MapWrapper.set(this._applications, token, testability);
  }

  findTestabilityInTree(elem) : Testability {
    if (elem == null) {
      return null;
    }
    if (MapWrapper.contains(this._applications, elem)) {
      return MapWrapper.get(this._applications, elem);
    }
    if (DOM.isShadowRoot(elem)) {
      return this.findTestabilityInTree(DOM.getHost(elem));
    }
    return this.findTestabilityInTree(DOM.parentElement(elem));
  }
}
