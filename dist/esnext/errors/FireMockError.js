export class FireMockError extends Error {
    constructor(message, classification = "firemock/error") {
        super(message);
        this.firemodel = true;
        const [cat, subcat] = classification.split("/");
        this.code = subcat || "error";
        this.name = classification;
    }
}
//# sourceMappingURL=FireMockError.js.map