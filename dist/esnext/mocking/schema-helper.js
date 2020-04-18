export class SchemaHelper {
    constructor(context, faker) {
        this.context = context;
        if (faker) {
            this._faker = faker;
        }
    }
    /**
     * static initializer which allows the **faker** library
     * to be instantiated asynchronously. Alternatively,
     * you can pass in an instance of faker to this function
     * to avoid any need for delay.
     *
     * Note: the _constructor_ also allows passing the faker
     * library in so this initializer's main "value" is to
     * ensure that faker is ready before the faker getter is
     * used.
     */
    static async create(context, faker) {
        const obj = new SchemaHelper(context, faker);
    }
    get faker() {
        return this._faker;
    }
}
//# sourceMappingURL=schema-helper.js.map