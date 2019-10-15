"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** an filter function for queries with a `limitToFirst` value */
function limitToFirst(query) {
    const value = query.identity.limitToFirst;
    return (list) => {
        if (value === undefined) {
            return list;
        }
        return list.slice(0, value);
    };
}
exports.limitToFirst = limitToFirst;
/** an filter function for queries with a `limitToLast` value */
function limitToLast(query) {
    const value = query.identity.limitToLast;
    return (list) => {
        if (value === undefined) {
            return list;
        }
        return list.slice(-1 * value);
    };
}
exports.limitToLast = limitToLast;
//# sourceMappingURL=limitFilters.js.map