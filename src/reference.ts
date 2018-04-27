// tslint:disable:no-implicit-dependencies
import { rtdb } from "firebase-api-surface";
import { IDictionary } from "common-types";
import Query from "./query";
import SnapShot from "./snapshot";
import Disconnected from "./disconnected";
import get = require("lodash.get");

import { db, setDB, updateDB, newId, pushDB, removeDB, multiPathUpdateDB } from "./database";
import {
  parts,
  normalizeRef,
  leafNode,
  getRandomInt,
  removeKeys,
  join,
  slashNotation,
  networkDelay,
  DelayType
} from "./util";
// tslint:disable-next-line:no-submodule-imports
import { IThenableReference, IReference } from "firebase-api-surface/lib/rtdb";

function isMultiPath(data: IDictionary) {
  Object.keys(data).map((d: any) => {
    if (!d) {
      data[d] = "/";
    }
  });
  const indexesAreStrings = Object.keys(data).every(i => typeof i === "string");
  const indexesLookLikeAPath = Object.keys(data).every(i => i.indexOf("/") !== -1);
  return indexesAreStrings && indexesLookLikeAPath ? true : false;
}

export default class Reference<T = any> extends Query<T> implements IReference {
  public get key(): string | null {
    return this.path.split(".").pop();
  }

  public get parent(): IReference | null {
    const r = parts(this.path)
      .slice(-1)
      .join(".");
    return new Reference(r, get(db, r));
  }

  public child<C = any>(path: string): IReference {
    const r = parts(this.path)
      .concat([path])
      .join(".");
    return new Reference<C>(r, get(db, r));
  }

  public get root(): IReference {
    return new Reference("/", db);
  }

  public push(
    value?: any,
    onComplete?: (a: Error | null) => any
  ): IThenableReference<T> {
    if (value) {
      const id = pushDB(this.path, value);
      const ref = new Reference<T>(join(this.path, id), db);
      const then = new ThenableReference<T>(join(this.path, id), db, networkDelay(ref));
      if (onComplete) {
        then.then(() => onComplete(null));
      }
      return then;
    } else {
      const id = newId();
      const ref = new Reference<T>(join(this.path, id), db);
      // no-arg push should not have any network delay
      const then = new ThenableReference<T>(join(this.path, id), db, Promise.resolve(ref));
      if (onComplete) {
        then.then(() => onComplete(null));
      }
      return then;
    }
  }

  public remove(onComplete?: (a: Error | null) => any): Promise<void> {
    removeDB(this.path);
    if (onComplete) {
      onComplete(null);
    }
    return networkDelay<void>();
  }

  public set(value: any, onComplete?: (a: Error | null) => any): Promise<void> {
    setDB(this.path, value);
    if (onComplete) {
      onComplete(null);
    }
    return networkDelay<void>();
  }

  public update(values: IDictionary, onComplete?: (a: Error | null) => any): Promise<void> {
    if (isMultiPath(values)) {
      multiPathUpdateDB(values);
    } else {
      updateDB(this.path, values);
    }
    if (onComplete) {
      onComplete(null);
    }
    return networkDelay<void>();
  }

  public setPriority(
    priority: string | number | null,
    onComplete: (a: Error | null) => any
  ): Promise<void> {
    return networkDelay<void>();
  }

  public setWithPriority(
    newVal: any,
    newPriority: string | number | null,
    onComplete: (a: Error | null) => any
  ) {
    return networkDelay<void>();
  }

  public transaction(
    transactionUpdate: (a: Partial<T>) => Partial<T>,
    onComplete?: (a: Error | null, b: boolean, c: rtdb.IDataSnapshot<T> | null) => any,
    applyLocally?: boolean
  ): Promise<rtdb.ITransactionResult> {
    return Promise.resolve({
      committed: true,
      snapshot: null,
      toJSON() {
        return {};
      }
    });
  }

  public onDisconnect(): rtdb.IOnDisconnect {
    return new Disconnected();
  }

  public toString() {
    return slashNotation(join("https://mockdb.local", this.path, this.key));
  }
}

// Implements IThenableReference by inheriting from our concrete Reference and composing a promise.
export class ThenableReference<T = any> extends Reference<T> implements IThenableReference<T> {
  constructor(path: string, delay: DelayType = 5, private promise: Promise<IReference<T>>) {
    super(path, delay);
  }

  public then<TResult1 = IReference<T>, TResult2 = never>(
    onfulfilled?: ((value: IReference<T>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }
}