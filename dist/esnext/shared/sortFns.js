import { QueryOrderType } from "serialized-query";
export const orderByChild = (child) => {
    return (a, b) => {
        return a[child] > b[child] ? -1 : a[child] === b[child] ? 0 : 1;
    };
};
export const orderByKey = (a, b) => {
    return a.id > b.id ? -1 : a.id === b.id ? 0 : 1;
};
export const orderByValue = (a, b) => {
    return a.value > b.value ? -1 : a.value === b.value ? 0 : 1;
};
export function isOrderByChild(query, fn) {
    return query.identity.orderBy === QueryOrderType.orderByChild;
}
//# sourceMappingURL=sortFns.js.map