import Query from "./query";
import { get } from "lodash";
import { db, setDB, updateDB, pushDB, removeDB, multiPathUpdateDB } from "./database";
import { parts, join, slashNotation, networkDelay } from "./util";
function isMultiPath(data) {
    Object.keys(data).map((d) => {
        if (!d) {
            data[d] = "/";
        }
    });
    const indexesAreStrings = Object.keys(data).every(i => typeof i === "string");
    const indexesLookLikeAPath = Object.keys(data).every(i => i.indexOf("/") !== -1);
    return indexesAreStrings && indexesLookLikeAPath ? true : false;
}
export default class Reference extends Query {
    get key() {
        return this.path.split(".").pop();
    }
    get parent() {
        const r = parts(this.path)
            .slice(-1)
            .join(".");
        return new Reference(r, get(db, r));
    }
    child(path) {
        const r = parts(this.path)
            .concat([path])
            .join(".");
        return new Reference(r, get(db, r));
    }
    get root() {
        return new Reference("/", db);
    }
    push(value, onComplete) {
        const id = pushDB(this.path, value);
        this.path = join(this.path, id);
        if (onComplete) {
            onComplete(null);
        }
        // TODO: try and get this typed appropriately
        return networkDelay(this);
    }
    remove(onComplete) {
        removeDB(this.path);
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    set(value, onComplete) {
        setDB(this.path, value);
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    update(values, onComplete) {
        if (isMultiPath(values)) {
            multiPathUpdateDB(values);
        }
        else {
            updateDB(this.path, values);
        }
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    setPriority(priority, onComplete) {
        return networkDelay();
    }
    setWithPriority(newVal, newPriority, onComplete) {
        return networkDelay();
    }
    transaction(transactionUpdate, onComplete, applyLocally) {
        return Promise.resolve({
            committed: true,
            snapshot: null,
            toJSON() {
                return {};
            }
        });
    }
    onDisconnect() {
        return {};
    }
    toString() {
        return this.path
            ? slashNotation(join("FireMock::Reference@", this.path, this.key))
            : "FireMock::Reference@uninitialized (aka, no path) mock Reference object";
    }
}
