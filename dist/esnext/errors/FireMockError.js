export class FireMockError extends Error {
    constructor(message, name = "firemock/error") {
        super(message);
        this.firemodel = true;
        this.name = name;
        this.code = name.split("/").pop();
    }
}
//# sourceMappingURL=FireMockError.js.map