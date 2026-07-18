import { DomainError } from './domain-error';

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';

  constructor(message = 'Forbidden') {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
