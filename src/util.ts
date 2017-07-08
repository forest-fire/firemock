import { first, last } from 'lodash';
import { IDictionary } from 'common-types';

export function normalizeRef(r: string) {
  r = r.replace('/', '.');
  r = r.slice(0, 1) === '.'
    ? r.slice(1)
    : r;

  return r;
}

export function parts(r: string) {
  return normalizeRef(r).split('.');  
};

/** 
 * return the last component of the path 
 * which typically would represent the 'id'
 * of a list-node
 */
export function leafNode(r: string) {
  return parts(r).pop();
}

export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function firstProp<T = IDictionary>(listOf: IDictionary<any>) {
  return listOf ? listOf[firstKey(listOf)] : {};
};

export function lastProp<T = IDictionary>(listOf: IDictionary<any>) {
  return listOf[lastKey(listOf)] as T;
};

export function objectIndex(obj: IDictionary, index: number) {
  console.log(obj);
  const keys = Object.keys(obj);
  return keys ? obj[keys[index - 1]] : null;
}

export function firstKey<T = any>(listOf: IDictionary<T>) {
  return first(Object.keys(listOf));
}

export function lastKey<T = any>(listOf: IDictionary<T>) {
  return last(Object.keys(listOf));
}

export function removeKeys(obj: IDictionary, remove: string[]) {
  return Object.keys(obj).reduce((agg: IDictionary, v: any) => {
    if (remove.indexOf(v) === -1) {
      agg[v] = obj[v];
    }
    return agg;
  }, {});
}
