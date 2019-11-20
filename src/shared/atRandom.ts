export function atRandom<T = any>(things: T[], excluding: T[] = []) {
  things = things.filter(i => !excluding.includes(i));
  const random = Math.floor(Math.random() * things.length);
  return things[random];
}
