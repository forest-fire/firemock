import { IDictionary } from "common-types";
import get from "lodash.get";
import {
  RtdbReference,
  RtdbDataSnapshot,
  RtdbThenableReference,
  RtdbEventType,
  IFirebaseEventHandler
} from "../@types/rtdb-types";

import {
  setDB,
  updateDB,
  pushDB,
  removeDB,
  multiPathUpdateDB,
  SnapShot,
  addListener,
  Query
} from "../rtdb/index";
import {
  parts,
  join,
  slashNotation,
  networkDelay,
  DelayType
} from "../shared/index";
import { SerializedQuery } from "serialized-query";
import { getDb } from "./store";

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

export class Reference<T = any> extends Query<T> implements RtdbReference {
  public static createQuery(
    query: string | SerializedQuery,
    delay: DelayType = 5
  ) {
    if (typeof query === "string") {
      query = new SerializedQuery(query);
    }
    const obj = new Reference(query.path, delay);
    obj._query = query;
    return obj;
  }
  public static create(path: string) {
    return new Reference(path);
  }

  constructor(path: string, _delay: DelayType = 5) {
    super(path, _delay);
  }

  public get key(): string | null {
    return this.path.split(".").pop();
  }

  public get parent(): RtdbReference | null {
    const r = parts(this.path)
      .slice(-1)
      .join(".");
    return new Reference(r, getDb(r));
  }

  public child<C = any>(path: string): Reference {
    const r = parts(this.path)
      .concat([path])
      .join(".");
    return new Reference<C>(r, getDb(r));
  }

  public get root(): Reference {
    return new Reference("/", getDb("/"));
  }

  public push(
    value?: any,
    onComplete?: (a: Error | null) => any
  ): RtdbThenableReference {
    const id = pushDB(this.path, value);
    this.path = join(this.path, id);
    if (onComplete) {
      onComplete(null);
    }

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
    onComplete?: (
      a: Error | null,
      b: boolean,
      c: RtdbDataSnapshot | null
    ) => any,
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

  protected getSnapshot<T extends RtdbDataSnapshot>(key: string, value: any) {
    return new SnapShot<T>(key, value);
  }

  protected addListener(
    pathOrQuery: string | SerializedQuery<any>,
    eventType: RtdbEventType,
    callback: IFirebaseEventHandler,
    cancelCallbackOrContext?: (err?: Error) => void,
    context?: IDictionary
  ): Promise<RtdbDataSnapshot> {
    return addListener(
      pathOrQuery,
      eventType,
      callback,
      cancelCallbackOrContext,
      context
    );
  }
}
