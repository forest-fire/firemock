import { IDictionary } from "common-types";
import Query from "./query";
import get from "lodash.get";
import {
  Reference as IReference,
  ThenableReference as IThenableReference,
  DataSnapshot
} from "@firebase/database-types";

import {
  db,
  setDB,
  updateDB,
  pushDB,
  removeDB,
  multiPathUpdateDB
} from "./database";
import { parts, join, slashNotation, networkDelay } from "./util";

function isMultiPath(data: IDictionary) {
  Object.keys(data).map((d: any) => {
    if (!d) {
      data[d] = "/";
    }
  });
  const indexesAreStrings = Object.keys(data).every(i => typeof i === "string");
  const indexesLookLikeAPath = Object.keys(data).every(
    i => i.indexOf("/") !== -1
  );
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

  public child<C = any>(path: string): Reference {
    const r = parts(this.path)
      .concat([path])
      .join(".");
    return new Reference<C>(r, get(db, r));
  }

  public get root(): Reference {
    return new Reference("/", db);
  }

  public push(
    value?: any,
    onComplete?: (a: Error | null) => any
  ): IThenableReference {
    const id = pushDB(this.path, value);
    this.path = join(this.path, id);
    if (onComplete) {
      onComplete(null);
    }

    // TODO: try and get this typed appropriately
    const ref = networkDelay<Reference<T>>(this);
    return ref as any;
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
    onComplete?: (a: Error | null, b: boolean, c: DataSnapshot | null) => any,
    applyLocally?: boolean
  ) {
    return Promise.resolve({
      committed: true,
      snapshot: null,
      toJSON() {
        return {};
      }
    });
  }

  public onDisconnect(): any {
    return {};
  }

  public toString() {
    return this.path
      ? slashNotation(join("FireMock::Reference@", this.path, this.key))
      : "FireMock::Reference@uninitialized (aka, no path) mock Reference object";
  }
}
