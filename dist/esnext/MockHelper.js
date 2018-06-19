export class MockHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        const faker = require("faker");
        return faker;
    }
    get chance() {
        const chance = require("chance");
        return chance();
    }
}
