import { createError } from "common-types";
import { faker } from "./mock";
export class MockHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        if (!faker) {
            throw createError(`firemock/not-ready`, `The mock helper can not provide the MockHelper object until after the faker library has been imported with a 'await importFakerLibrary()' call.`);
        }
        return faker;
    }
}
