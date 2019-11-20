export function atRandom(things, excluding = []) {
    things = things.filter(i => !excluding.includes(i));
    const random = Math.floor(Math.random() * things.length);
    return things[random];
}
//# sourceMappingURL=atRandom.js.map