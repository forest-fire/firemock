import { SerializedQuery } from "serialized-query";

/** an filter function for queries with a `limitToFirst` value */
export function limitToFirst(query: SerializedQuery) {
  const value = query.identity.limitToFirst;

  return (list: any[]) => {
    if (value === undefined) {
      return list;
    }

    return list.slice(0, value);
  };
}

/** an filter function for queries with a `limitToLast` value */
export function limitToLast(query: SerializedQuery) {
  const value = query.identity.limitToLast;

  return (list: any[]) => {
    if (value === undefined) {
      return list;
    }

    return list.slice(-1 * value);
  };
}
