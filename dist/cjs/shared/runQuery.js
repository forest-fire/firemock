"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialized_query_1 = require("serialized-query");
const typed_conversions_1 = require("typed-conversions");
const sortFns = __importStar(require("./sortFns"));
const queryFilters = __importStar(require("./queryFilters"));
const limitFilters = __importStar(require("./limitFilters"));
function runQuery(query, data) {
    /**
     * A boolean _flag_ to indicate whether the path is of the query points to a Dictionary
     * of Objects. This is indicative of a **Firemodel** list node.
     */
    const isListOfObjects = typeof data === "object" &&
        Object.keys(data).every(i => typeof data[i] === "object");
    const dataIsAScalar = ["string", "boolean", "number"].includes(typeof data);
    if (dataIsAScalar) {
        return data;
    }
    const anArrayOfScalar = Array.isArray(data) && data.every(i => typeof i !== "object");
    const dataIsAnObject = !Array.isArray(data) && typeof data === "object";
    if (dataIsAnObject && !isListOfObjects) {
        // allows non-array data that can come from a 'value' listener
        // to pass through at this point
        return data;
    }
    const dataList = isListOfObjects || dataIsAnObject ? typed_conversions_1.hashToArray(data) : data;
    if (!dataList) {
        return undefined;
    }
    const limitFilter = _limitFilter(query);
    const queryFilter = _queryFilter(query);
    const sortFn = query.identity.orderBy === serialized_query_1.QueryOrderType.orderByChild
        ? sortFns.orderByChild(query.identity.orderByKey)
        : sortFns[query.identity.orderBy];
    const list = limitFilter(queryFilter(dataList.sort(sortFn)));
    return isListOfObjects
        ? // this is list of records to convert back to hash for Firebase compatability
            typed_conversions_1.arrayToHash(list)
        : dataIsAnObject
            ? // if it was an Object but values weren't objects then this is probably
                // a key/value pairing
                list.reduce((agg, curr) => {
                    if (curr.id && curr.value) {
                        // definitely looks like a id/value pairing
                        agg[curr.id] = curr.value;
                    }
                    else if (curr.id) {
                        // has an ID so offset using the id but use the remainder of the hash
                        // as the value
                        const hash = Object.assign({}, curr);
                        delete hash.id;
                        agg[curr.id] = hash;
                    }
                    else {
                        console.log({
                            message: `Unsure what to do with part of a data structure resulting from the the query: ${query.identity}.\n\nThe item in question was: "${curr}".`,
                            severity: 0
                        });
                    }
                    return agg;
                }, {})
            : list;
}
exports.runQuery = runQuery;
function _limitFilter(query) {
    const first = limitFilters.limitToFirst(query);
    const last = limitFilters.limitToLast(query);
    return (list) => {
        return first(last(list));
    };
}
function _queryFilter(query) {
    return (list) => {
        return list
            .filter(queryFilters.equalTo(query))
            .filter(queryFilters.startAt(query))
            .filter(queryFilters.endAt(query));
    };
}
//# sourceMappingURL=runQuery.js.map