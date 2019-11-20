"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function atRandom(things, excluding = []) {
    things = things.filter(i => !excluding.includes(i));
    const random = Math.floor(Math.random() * things.length);
    return things[random];
}
exports.atRandom = atRandom;
//# sourceMappingURL=atRandom.js.map