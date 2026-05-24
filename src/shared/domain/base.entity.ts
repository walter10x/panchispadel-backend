export abstract class BaseEntity<TId = string> {
  public readonly id: TId;
  public readonly createdAt: Date;

  protected constructor(id: TId, createdAt?: Date) {
    this.id = id;
    this.createdAt = createdAt ?? new Date();
  }

  public equals(other: BaseEntity<TId>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof BaseEntity)) {
      return false;
    }
    return this.id === other.id;
  }
}
