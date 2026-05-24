import { DomainError } from './domain-error';

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  constructor(message = 'Validation error') {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
