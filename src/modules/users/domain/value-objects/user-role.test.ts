import { UserRole } from './user-role';
import { ValidationError } from '../../../../shared/domain/errors';

describe('UserRole', () => {
  it('crea rol player y admin', () => {
    expect(UserRole.player().value).toBe('player');
    expect(UserRole.admin().value).toBe('admin');
    expect(UserRole.admin().isAdmin).toBe(true);
    expect(UserRole.player().isAdmin).toBe(false);
  });

  it('acepta strings válidos con from', () => {
    expect(UserRole.from('admin').toString()).toBe('admin');
    expect(UserRole.from('player').toString()).toBe('player');
  });

  it('lanza ValidationError para rol inválido', () => {
    expect(() => UserRole.from('superuser')).toThrow(ValidationError);
  });
});
