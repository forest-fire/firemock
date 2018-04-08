// tslint:disable:no-implicit-dependencies
import { rtdb } from "firebase-api-surface";
import { IDictionary } from "common-types";
import Query from "./query";
import SnapShot from "./snapshot";
import Disconnected from "./disconnected";
import get = require("lodash.get");

import { db, setDB, updateDB, pushDB, removeDB, multiPathUpdateDB } from "./database";
import {
  parts,
  normalizeRef,
  leafNode,
  getRandomInt,
  removeKeys,
  join,
  slashNotation,
  networkDelay
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
  ): IThenableReference<IReference<T>> {
    const id = pushDB(this.path, value);
    this.path = join(this.path, id);
    if (onComplete) {
      onComplete(null);
    }

    return networkDelay<T>(this) as any; // TODO: try and get this typed appropriately
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
