import { faker } from "./mock";
export default class SchemaHelper {
    constructor(raw) {
        this._db = raw;
    }
    get faker() {
        return faker;
    }
}
