"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function startAt(query) {
    const key = query.identity.startAtKey;
    const value = query.identity.startAt;
    return (record) => {
        if (value === undefined) {
            return true;
        }
        return key ? record[key] >= value : record >= value;
    };
}
exports.startAt = startAt;
function endAt(query) {
    const key = query.identity.endAtKey;
    const value = query.identity.endAt;
    return (record) => {
        if (value === undefined) {
            return true;
        }
        return key ? record[key] <= value : record <= value;
    };
}
exports.endAt = endAt;
/** a filter function for queries with a `equalTo` value */
function equalTo(query) {
    const key = query.identity.equalToKey;
    const value = query.identity.equalTo;
    return (record) => {
        if (value === undefined) {
            return true;
        }
        return key ? record[key] === value : record === value;
    };
}
exports.equalTo = equalTo;
//# sourceMappingURL=queryFilters.js.map