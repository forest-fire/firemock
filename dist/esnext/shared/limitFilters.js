/** an filter function for queries with a `limitToFirst` value */
export function limitToFirst(query) {
    const value = query.identity.limitToFirst;
    return (list) => {
        if (value === undefined) {
            return list;
        }
        return list.slice(0, value);
    };
}
/** an filter function for queries with a `limitToLast` value */
export function limitToLast(query) {
    const value = query.identity.limitToLast;
    return (list) => {
        if (value === undefined) {
            return list;
        }
        return list.slice(-1 * value);
    };
}
//# sourceMappingURL=limitFilters.js.map