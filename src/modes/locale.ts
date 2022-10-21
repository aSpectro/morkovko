import { capitalize } from 'src/morkovko/commands/helpers';

interface Enum {
  [key: string]: string
}

export class Locale {
  public name: string;
  private currency: string;
  private bonus: number;
  private enums: Enum;

  constructor(name: string, currency: string, bonus: number, enums: Enum) {
    this.name = name;
    this.currency = currency;
    this.bonus = bonus;
    this.enums = enums;
  }

  public getCurrency(): string {
    return this.currency
  }

  public getBonus(isActive): number {
    return !isActive ? 1 : this.bonus
  }

  public getEnum(path, upperCase = false) {
    return upperCase ? capitalize(this.enums[path]) : this.enums[path]
  }
}