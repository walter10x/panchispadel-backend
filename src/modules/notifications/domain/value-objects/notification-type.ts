import { ValueObject } from '../../../../shared/domain/value-object';

export const NOTIFICATION_TYPE_VALUES = [
  'match_created',
  'match_full',
  'match_cancelled',
  'result_pending',
  'result_confirmed',
  'player_joined',
  'player_left',
  'player_rejected',
] as const;

export type NotificationTypeValue = (typeof NOTIFICATION_TYPE_VALUES)[number];

export class NotificationType extends ValueObject {
  private readonly value: NotificationTypeValue;

  private constructor(value: NotificationTypeValue) {
    super();
    this.value = value;
  }

  static create(value: string): NotificationType {
    if (!isNotificationTypeValue(value)) {
      throw new Error(
        `Invalid NotificationType: "${value}". Allowed: ${NOTIFICATION_TYPE_VALUES.join(', ')}`,
      );
    }
    return new NotificationType(value);
  }

  static from(value: string): NotificationType {
    return new NotificationType(value as NotificationTypeValue);
  }

  getValue(): NotificationTypeValue {
    return this.value;
  }

  protected validate(): void {
    // Validation is done in create() via isNotificationTypeValue check
  }

  toString(): string {
    return this.value;
  }
}

function isNotificationTypeValue(value: string): value is NotificationTypeValue {
  return (NOTIFICATION_TYPE_VALUES as readonly string[]).includes(value);
}
