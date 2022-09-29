import random from 'random';

export function getUserFromMention(client, mention) {
  const matches = mention.match(/^<@!?(\d+)>$/);
  const id = matches ? matches[1] : '';

  return client.users.cache.get(id);
}

export function randomNumber(max: number, min: number): number {
  const rand = min + random.float(0, 1) * (max + 1 - min);
  return Math.floor(rand);
}

export function randomArrayElement(items: any): any {
  return items[~~(items.length * random.float(0, 1))];
}

export function isObjectEmpty(obj): boolean {
  if (Object.keys(obj).length === 0 && obj.constructor === Object) {
    return true;
  } else {
    return false;
  }
}

export function numberWithSpaces(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
