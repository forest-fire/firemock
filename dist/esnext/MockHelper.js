export class MockHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        const faker = require("faker");
        return faker;
    }
}
