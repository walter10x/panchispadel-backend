export abstract class ValueObject {
  protected abstract validate(): void;

  protected constructor() {
    this.validate();
  }

  public equals(other: ValueObject): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this.constructor !== other.constructor) {
      return false;
    }
    return this.toString() === other.toString();
  }

  abstract toString(): string;
}
