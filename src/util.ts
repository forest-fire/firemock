
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