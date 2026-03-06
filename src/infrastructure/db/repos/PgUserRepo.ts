import type { Pool } from 'pg';
import type { IUserRepo } from '../../../domain/user/repos/IUserRepo.js';
import type { User } from '../../../domain/user/User.js';
import { UserMapper, type UserPersistence } from '../mappers/UserMapper.js';

export class PgUserRepo implements IUserRepo {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query<UserPersistence>(
      `SELECT id, email, password_hash, role, two_factor_enabled, two_factor_secret, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    if (!row) return null;
    return UserMapper.toDomain(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<UserPersistence>(
      `SELECT id, email, password_hash, role, two_factor_enabled, two_factor_secret, is_active, created_at, updated_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()],
    );
    const row = result.rows[0];
    if (!row) return null;
    return UserMapper.toDomain(row);
  }

  async save(user: User): Promise<void> {
    const raw = UserMapper.toPersistence(user);

    await this.pool.query(
      `INSERT INTO users (id, email, password_hash, role, two_factor_enabled, two_factor_secret, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         two_factor_enabled = EXCLUDED.two_factor_enabled,
         two_factor_secret = EXCLUDED.two_factor_secret,
         is_active = EXCLUDED.is_active,
         updated_at = EXCLUDED.updated_at`,
      [
        raw.id,
        raw.email,
        raw.password_hash,
        raw.role,
        raw.two_factor_enabled,
        raw.two_factor_secret,
        raw.is_active,
        raw.created_at,
        raw.updated_at,
      ],
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.pool.query('SELECT 1 FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);
    return (result.rowCount ?? 0) > 0;
  }
}
