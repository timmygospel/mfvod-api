import { describe, it, expect } from 'vitest';
import { User } from '../User.js';
import { UserEmail } from '../valueObjects/UserEmail.js';
import { UserPassword } from '../valueObjects/UserPassword.js';
import { UserRole } from '../valueObjects/UserRole.js';
import { UniqueEntityID } from '../../shared/UniqueEntityID.js';

describe('UserEmail', () => {
  it('should create a valid email', () => {
    const result = UserEmail.create('test@example.com');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('test@example.com');
  });

  it('should normalise email to lowercase', () => {
    const result = UserEmail.create('Test@Example.COM');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('test@example.com');
  });

  it('should fail on invalid email', () => {
    expect(UserEmail.create('not-an-email').isFailure).toBe(true);
    expect(UserEmail.create('').isFailure).toBe(true);
    expect(UserEmail.create('@no-local.com').isFailure).toBe(true);
  });
});

describe('UserPassword', () => {
  it('should create a hashed password', async () => {
    const result = await UserPassword.createHashed('StrongPass1!');
    expect(result.isSuccess).toBe(true);
    expect(result.value.isHashed).toBe(true);
  });

  it('should fail when password is too short', async () => {
    const result = await UserPassword.createHashed('Ab1!');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when password has no uppercase', async () => {
    const result = await UserPassword.createHashed('weakpass1!');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when password has no number', async () => {
    const result = await UserPassword.createHashed('StrongPass!');
    expect(result.isFailure).toBe(true);
  });

  it('should compare correctly', async () => {
    const result = await UserPassword.createHashed('StrongPass1!');
    const password = result.value;
    expect(await password.compareWith('StrongPass1!')).toBe(true);
    expect(await password.compareWith('WrongPass1!')).toBe(false);
  });

  it('should reconstitute from already-hashed string', async () => {
    const hashed = await UserPassword.createHashed('StrongPass1!');
    const hash = hashed.value.hashValue;
    const reconstituted = UserPassword.reconstitute(hash);
    expect(reconstituted.isHashed).toBe(true);
    expect(await reconstituted.compareWith('StrongPass1!')).toBe(true);
  });
});

describe('UserRole', () => {
  it('should create admin role', () => {
    const result = UserRole.create('admin');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('admin');
    expect(result.value.isAdmin).toBe(true);
  });

  it('should create subscriber role', () => {
    const result = UserRole.create('subscriber');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('subscriber');
    expect(result.value.isAdmin).toBe(false);
  });

  it('should fail on invalid role', () => {
    expect(UserRole.create('superuser').isFailure).toBe(true);
    expect(UserRole.create('').isFailure).toBe(true);
  });
});

describe('User', () => {
  const validEmail = 'user@example.com';
  const validPassword = 'StrongPass1!';

  it('should create a valid user', async () => {
    const result = await User.create({ email: validEmail, password: validPassword });
    expect(result.isSuccess).toBe(true);
    const user = result.value;
    expect(user.email.value).toBe(validEmail);
    expect(user.role.value).toBe('subscriber');
    expect(user.twoFactorEnabled).toBe(false);
    expect(user.twoFactorSecret).toBeNull();
    expect(user.isActive).toBe(true);
  });

  it('should create an admin user', async () => {
    const result = await User.create({ email: validEmail, password: validPassword, role: 'admin' });
    expect(result.isSuccess).toBe(true);
    expect(result.value.role.isAdmin).toBe(true);
  });

  it('should fail with invalid email', async () => {
    const result = await User.create({ email: 'bad-email', password: validPassword });
    expect(result.isFailure).toBe(true);
  });

  it('should fail with weak password', async () => {
    const result = await User.create({ email: validEmail, password: 'weak' });
    expect(result.isFailure).toBe(true);
  });

  it('should setup two factor', async () => {
    const user = (await User.create({ email: validEmail, password: validPassword })).value;
    const secret = 'TOTP_SECRET_BASE32';
    user.setupTwoFactor(secret);
    expect(user.twoFactorEnabled).toBe(true);
    expect(user.twoFactorSecret).toBe(secret);
  });

  it('should disable two factor', async () => {
    const user = (await User.create({ email: validEmail, password: validPassword })).value;
    user.setupTwoFactor('SECRET');
    user.disableTwoFactor();
    expect(user.twoFactorEnabled).toBe(false);
    expect(user.twoFactorSecret).toBeNull();
  });

  it('should deactivate user', async () => {
    const user = (await User.create({ email: validEmail, password: validPassword })).value;
    user.deactivate();
    expect(user.isActive).toBe(false);
  });

  it('should reconstitute from persistence', () => {
    const id = new UniqueEntityID();
    const now = new Date();
    const user = User.reconstitute(
      {
        email: validEmail,
        passwordHash: '$2b$10$fakehash',
        role: 'admin',
        twoFactorEnabled: true,
        twoFactorSecret: 'SECRET',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
    expect(user.id.equals(id)).toBe(true);
    expect(user.email.value).toBe(validEmail);
    expect(user.role.isAdmin).toBe(true);
    expect(user.twoFactorEnabled).toBe(true);
    expect(user.twoFactorSecret).toBe('SECRET');
    expect(user.isActive).toBe(true);
  });
});
