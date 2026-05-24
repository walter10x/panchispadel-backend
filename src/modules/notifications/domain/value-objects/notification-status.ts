import { ValueObject } from '../../../../shared/domain/value-object';

export const NOTIFICATION_STATUS_VALUES = ['unread', 'read'] as const;

export type NotificationStatusValue = (typeof NOTIFICATION_STATUS_VALUES)[number];

export class NotificationStatus extends ValueObject {
  private readonly value: NotificationStatusValue;

  private constructor(value: NotificationStatusValue) {
    super();
    this.value = value;
  }

  static create(value: string): NotificationStatus {
    if (!isNotificationStatusValue(value)) {
      throw new Error(
        `Invalid NotificationStatus: "${value}". Allowed: ${NOTIFICATION_STATUS_VALUES.join(', ')}`,
      );
    }
    return new NotificationStatus(value);
  }

  static from(value: string): NotificationStatus {
    return new NotificationStatus(value as NotificationStatusValue);
  }

  getValue(): NotificationStatusValue {
    return this.value;
  }

  isRead(): boolean {
    return this.value === 'read';
  }

  protected validate(): void {
    // Validation is done in create() via isNotificationStatusValue check
  }

  toString(): string {
    return this.value;
  }
}

function isNotificationStatusValue(value: string): value is NotificationStatusValue {
  return (NOTIFICATION_STATUS_VALUES as readonly string[]).includes(value);
}
