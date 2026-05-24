import { DomainError } from './domain-error';

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';

  constructor(message = 'Unauthorized') {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
