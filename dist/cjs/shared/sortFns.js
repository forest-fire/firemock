"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serialized_query_1 = require("serialized-query");
exports.orderByChild = (child) => {
    return (a, b) => {
        return a[child] > b[child] ? -1 : a[child] === b[child] ? 0 : 1;
    };
};
exports.orderByKey = (a, b) => {
    return a.id > b.id ? -1 : a.id === b.id ? 0 : 1;
};
exports.orderByValue = (a, b) => {
    return a.value > b.value ? -1 : a.value === b.value ? 0 : 1;
};
function isOrderByChild(query, fn) {
    return query.identity.orderBy === serialized_query_1.QueryOrderType.orderByChild;
}
exports.isOrderByChild = isOrderByChild;
//# sourceMappingURL=sortFns.js.map