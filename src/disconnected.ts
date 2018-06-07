import { IDictionary } from "common-types";
// import * as firebase from 'firebase-admin';
export default class Disconnected /** implements firebase.database.OnDisconnect */ {
  public cancel(onComplete?: (a: Error) => any): Promise<void> {
    return Promise.resolve();
  }

  public remove(onComplete?: (a: Error) => any): Promise<void> {
    return Promise.resolve();
  }

  public set(value: any, onComplete?: (a: Error | null) => any): Promise<void> {
    return Promise.resolve();
  }

  public setWithPriority(
    value: any,
    priority: number | string | null,
    onComplete?: (a: Error | null) => any
  ): Promise<void> {
    return Promise.resolve();
  }

  public update(
    values: IDictionary,
    onComplete?: (a: Error | null) => any
  ): Promise<void> {
    return Promise.resolve();
  }
}
