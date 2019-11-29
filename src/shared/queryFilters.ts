import { SerializedQuery } from "serialized-query";

export function startAt(query: SerializedQuery) {
  const key = query.identity.startAtKey || query.identity.orderByKey;
  const value = query.identity.startAt;

  return (record: any) => {
    if (value === undefined) {
      return true;
    }

    return key ? record[key] >= value : record >= value;
  };
}

export function endAt(query: SerializedQuery) {
  const key = query.identity.endAtKey || query.identity.orderByKey;
  const value = query.identity.endAt;

  return (record: any) => {
    if (value === undefined) {
      return true;
    }

    return key ? record[key] <= value : record <= value;
  };
}

/** a filter function for queries with a `equalTo` value */
export function equalTo(query: SerializedQuery) {
  const key = query.identity.equalToKey || query.identity.orderByKey;
  const value = query.identity.equalTo;

  return (record: any) => {
    if (value === undefined) {
      return true;
    }

    return key ? record[key] === value : record === value;
  };
}
