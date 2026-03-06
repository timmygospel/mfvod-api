import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUser } from '../RegisterUser.js';
import { LoginUser } from '../LoginUser.js';
import { SetupTwoFactor } from '../SetupTwoFactor.js';
import { VerifyTwoFactor } from '../VerifyTwoFactor.js';
import type { IUserRepo } from '../../../domain/user/repos/IUserRepo.js';
import type { User } from '../../../domain/user/User.js';

// Minimal in-memory repo for testing
function makeRepo(): IUserRepo & { store: Map<string, User> } {
  const store = new Map<string, User>();
  return {
    store,
    async findById(id) {
      for (const u of store.values()) {
        if (u.id.toValue() === id) return u;
      }
      return null;
    },
    async findByEmail(email) {
      for (const u of store.values()) {
        if (u.email.value === email) return u;
      }
      return null;
    },
    async save(user) {
      store.set(user.id.toValue(), user);
    },
    async existsByEmail(email) {
      for (const u of store.values()) {
        if (u.email.value === email) return true;
      }
      return false;
    },
  };
}

// Mock jwt helpers to avoid needing real secrets
vi.mock('../../../infrastructure/auth/jwt.js', () => ({
  signAccessToken: () => 'access.token.mock',
  signRefreshToken: () => 'refresh.token.mock',
  verifyRefreshToken: (token: string) => {
    if (token === 'refresh.token.mock') return { sub: 'user-id-placeholder' };
    throw new Error('invalid');
  },
}));

describe('RegisterUser', () => {
  it('should register a new user and return tokens', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUser(repo);

    const result = await useCase.execute({ email: 'user@example.com', password: 'StrongPass1!' });
    expect(result.isSuccess).toBe(true);
    expect(result.value.accessToken).toBe('access.token.mock');
    expect(result.value.refreshToken).toBe('refresh.token.mock');
    expect(result.value.user.email).toBe('user@example.com');
  });

  it('should fail when email is already taken', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUser(repo);

    await useCase.execute({ email: 'user@example.com', password: 'StrongPass1!' });
    const result = await useCase.execute({ email: 'user@example.com', password: 'AnotherPass1!' });
    expect(result.isFailure).toBe(true);
    expect(result.errorValue).toMatch(/already/i);
  });

  it('should fail with invalid email', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUser(repo);

    const result = await useCase.execute({ email: 'bad', password: 'StrongPass1!' });
    expect(result.isFailure).toBe(true);
  });

  it('should fail with weak password', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUser(repo);

    const result = await useCase.execute({ email: 'user@example.com', password: 'weak' });
    expect(result.isFailure).toBe(true);
  });
});

describe('LoginUser', () => {
  it('should login and return tokens when 2FA is disabled', async () => {
    const repo = makeRepo();
    await new RegisterUser(repo).execute({ email: 'user@example.com', password: 'StrongPass1!' });

    const useCase = new LoginUser(repo);
    const result = await useCase.execute({ email: 'user@example.com', password: 'StrongPass1!' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.requiresTwoFactor).toBe(false);
    expect(result.value.accessToken).toBe('access.token.mock');
  });

  it('should return requiresTwoFactor when 2FA is enabled', async () => {
    const repo = makeRepo();
    await new RegisterUser(repo).execute({ email: 'user@example.com', password: 'StrongPass1!' });
    const user = await repo.findByEmail('user@example.com');
    user!.setupTwoFactor('SOME_SECRET');
    await repo.save(user!);

    const useCase = new LoginUser(repo);
    const result = await useCase.execute({ email: 'user@example.com', password: 'StrongPass1!' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.requiresTwoFactor).toBe(true);
    expect(result.value.accessToken).toBeUndefined();
  });

  it('should fail with wrong password', async () => {
    const repo = makeRepo();
    await new RegisterUser(repo).execute({ email: 'user@example.com', password: 'StrongPass1!' });

    const useCase = new LoginUser(repo);
    const result = await useCase.execute({ email: 'user@example.com', password: 'WrongPass1!' });
    expect(result.isFailure).toBe(true);
  });

  it('should fail with unknown email', async () => {
    const repo = makeRepo();
    const useCase = new LoginUser(repo);
    const result = await useCase.execute({
      email: 'nobody@example.com',
      password: 'StrongPass1!',
    });
    expect(result.isFailure).toBe(true);
  });
});

describe('SetupTwoFactor', () => {
  it('should return a secret and qrcode uri', async () => {
    const repo = makeRepo();
    await new RegisterUser(repo).execute({ email: 'user@example.com', password: 'StrongPass1!' });
    const user = await repo.findByEmail('user@example.com');

    const useCase = new SetupTwoFactor(repo);
    const result = await useCase.execute({ userId: user!.id.toValue() });

    expect(result.isSuccess).toBe(true);
    expect(result.value.secret).toBeTruthy();
    expect(result.value.qrCodeUri).toContain('otpauth://');
  });

  it('should fail for unknown user', async () => {
    const repo = makeRepo();
    const useCase = new SetupTwoFactor(repo);
    const result = await useCase.execute({ userId: 'nonexistent-id' });
    expect(result.isFailure).toBe(true);
  });
});

describe('VerifyTwoFactor', () => {
  it('should fail with wrong TOTP code', async () => {
    const repo = makeRepo();
    await new RegisterUser(repo).execute({ email: 'user@example.com', password: 'StrongPass1!' });
    const user = await repo.findByEmail('user@example.com');
    // 32-char base32 = 20 bytes, satisfies otplib's minimum 16-byte requirement
    user!.setupTwoFactor('JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP');
    await repo.save(user!);

    const useCase = new VerifyTwoFactor(repo);
    const result = await useCase.execute({ userId: user!.id.toValue(), code: '000000' });
    // Code is almost certainly wrong unless we mock time
    expect(result.isFailure).toBe(true);
  });

  it('should fail for unknown user', async () => {
    const repo = makeRepo();
    const useCase = new VerifyTwoFactor(repo);
    const result = await useCase.execute({ userId: 'nonexistent', code: '123456' });
    expect(result.isFailure).toBe(true);
  });

  it('should fail when 2FA not set up', async () => {
    const repo = makeRepo();
    await new RegisterUser(repo).execute({ email: 'user@example.com', password: 'StrongPass1!' });
    const user = await repo.findByEmail('user@example.com');

    const useCase = new VerifyTwoFactor(repo);
    const result = await useCase.execute({ userId: user!.id.toValue(), code: '123456' });
    expect(result.isFailure).toBe(true);
  });
});
