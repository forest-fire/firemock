import { IDictionary } from "common-types";
import Query from "./query";
import SnapShot from "./snapshot";
import Disconnected from "./disconnected";
import get = require("lodash.get");

import { db, setDB, updateDB, pushDB, removeDB } from "./database";
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

import * as firebase from "firebase-admin";

export type IDBTransaction = Promise<{
  committed: boolean;
  snapshot: firebase.database.DataSnapshot;
}>;

export type AsyncOrSync<T> = Promise<SnapShot<T>> | SnapShot<T>;
export enum EventType {
  child_added = "child_added",
  child_removed = "child_removed",
  child_changed = "child_changed",
  child_moved = "child_moved",
  value = "value"
}

export default class Reference<T = any> extends Query
  implements firebase.database.Reference {
  public get key(): string | null {
    return this.path.split(".").pop();
  }

  public get parent(): firebase.database.Reference | null {
    const r = parts(this.path)
      .slice(-1)
      .join(".");
    return new Reference(r, get(db, r));
  }

  public child(path: string): Reference {
    const r = parts(this.path)
      .concat([path])
      .join(".");
    return new Reference(r, get(db, r));
  }

  public get root(): firebase.database.Reference {
    return new Reference("/", db);
  }

  public push(value?: any, onComplete?: (a: Error | null) => any): any {
    const id = pushDB(this.path, value);
    this.path = join(this.path, id);
    if (onComplete) {
      onComplete(null);
    }

    return networkDelay<firebase.database.Reference>(this);
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

  public update(
    values: IDictionary,
    onComplete?: (a: Error | null) => any
  ): Promise<void> {
    updateDB(this.path, values);
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
    transactionUpdate: (a: any) => any,
    onComplete?: (
      a: Error | null,
      b: boolean,
      c: firebase.database.DataSnapshot | null
    ) => any,
    applyLocally?: boolean
  ): Promise<{
    committed: boolean;
    snapshot: firebase.database.DataSnapshot | null;
  }> {
    return Promise.resolve({
      committed: true,
      snapshot: null
    });
  }

  public onDisconnect(): firebase.database.OnDisconnect {
    return new Disconnected();
  }

  public toString() {
    return slashNotation(join("https://mockdb.local", this.path, this.key));
  }
}
