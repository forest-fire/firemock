import { createError } from "common-types";
import { faker } from "./mock";
export class MockHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        if (!faker) {
            throw createError(`firemock/not-ready`, `The mock helper can not provide the faker object until after it the library has been imported with getMockHelper() call.`);
        }
        return faker;
    }
}
