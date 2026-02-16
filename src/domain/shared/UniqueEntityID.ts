import { v4 as uuidv4 } from 'uuid';

export class UniqueEntityID {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id ?? uuidv4();
  }

  equals(id?: UniqueEntityID): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    return id.toValue() === this.value;
  }

  toString(): string {
    return this.value;
  }

  toValue(): string {
    return this.value;
  }
}
