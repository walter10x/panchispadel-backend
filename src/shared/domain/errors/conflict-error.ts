import { DomainError } from './domain-error';

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';

  constructor(message = 'Conflict') {
    super(message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
