import { DomainError } from './domain-error';

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(message = 'Resource not found') {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
