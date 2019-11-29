export class FireMockError extends Error {
    constructor(message, name = "firemock/error") {
        super(message);
        this.firemodel = true;
        this.code = name;
    }
}
//# sourceMappingURL=FireMockError.js.map