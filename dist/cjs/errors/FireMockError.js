"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FireMockError extends Error {
    constructor(message, classification = "firemock/error") {
        super(message);
        this.firemodel = true;
        const [cat, subcat] = classification.split("/");
        this.code = subcat || "error";
        this.name = classification;
    }
}
exports.FireMockError = FireMockError;
//# sourceMappingURL=FireMockError.js.map