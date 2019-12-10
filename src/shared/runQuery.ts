import { SerializedQuery, QueryOrderType } from "serialized-query";
import { hashToArray, arrayToHash } from "typed-conversions";
import * as sortFns from "./sortFns";
import * as queryFilters from "./queryFilters";
import * as limitFilters from "./limitFilters";
import { IDictionary } from "common-types";

export function runQuery(query: SerializedQuery, data: any) {
  /**
   * A boolean _flag_ to indicate whether the path is of the query points to a Dictionary
   * of Objects. This is indicative of a **Firemodel** list node.
   */
  const isListOfObjects =
    typeof data === "object" &&
    Object.keys(data).every(i => typeof data[i] === "object");
  const dataIsAScalar = ["string", "boolean", "number"].includes(typeof data);

  if (dataIsAScalar) {
    return data;
  }

  const anArrayOfScalar =
    Array.isArray(data) && data.every(i => typeof i !== "object");
  const dataIsAnObject = !Array.isArray(data) && typeof data === "object";

  if (dataIsAnObject && !isListOfObjects) {
    // allows non-array data that can come from a 'value' listener
    // to pass through at this point
    return data;
  }

  const dataList = isListOfObjects || dataIsAnObject ? hashToArray(data) : data;

  if (!dataList) {
    return undefined;
  }

  const limitFilter = _limitFilter(query);
  const queryFilter = _queryFilter(query);

  const sortFn: sortFns.ISortFns =
    query.identity.orderBy === QueryOrderType.orderByChild
      ? sortFns.orderByChild(query.identity.orderByKey)
      : (sortFns[
          query.identity.orderBy as keyof typeof sortFns
        ] as sortFns.ISortFns);

  const list = limitFilter(queryFilter(dataList.sort(sortFn)));

  return isListOfObjects
    ? // this is list of records to convert back to hash for Firebase compatability
      arrayToHash(list)
    : dataIsAnObject
    ? // if it was an Object but values weren't objects then this is probably
      // a key/value pairing
      list.reduce((agg: IDictionary, curr) => {
        if (curr.id && curr.value) {
          // definitely looks like a id/value pairing
          agg[curr.id] = curr.value;
        } else if (curr.id) {
          // has an ID so offset using the id but use the remainder of the hash
          // as the value
          const hash = { ...curr };
          delete hash.id;
          agg[curr.id] = hash;
        } else {
          console.log({
            message: `Unsure what to do with part of a data structure resulting from the the query: ${query.identity}.\n\nThe item in question was: "${curr}".`,
            severity: 0
          });
        }

        return agg;
      }, {})
    : list;
}

function _limitFilter(query: SerializedQuery) {
  const first = limitFilters.limitToFirst(query);
  const last = limitFilters.limitToLast(query);

  return (list: any[]) => {
    return first(last(list));
  };
}

function _queryFilter(query: SerializedQuery) {
  return (list: any[]) => {
    return list
      .filter(queryFilters.equalTo(query))
      .filter(queryFilters.startAt(query))
      .filter(queryFilters.endAt(query));
  };
}
