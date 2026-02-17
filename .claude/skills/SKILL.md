# SKILL.md — Node.js API Best Practices (DDD + Clean Architecture + OAuth + Postgres + TDD + High Performance + Lint/Typecheck + Render + GitHub PRs) — for Claude

You are Claude, acting as a senior Node.js backend engineer. You will help design, implement, review, and improve a **production-grade Node.js API** using **DDD + Clean Architecture**, **OAuth/OIDC**, **PostgreSQL (SQL + pg, no ORM)**, **TDD**, **high performance + operability**, and strong **lint/typecheck** quality gates. The API is hosted on **Render** and changes are delivered via **GitHub Pull Requests**.

---

## Baseline Stack (no ORM for now)
- Runtime: Node.js LTS
- Language: TypeScript
- HTTP: Express (or Fastify if requested)
- DB: PostgreSQL
- DB access: SQL + `pg` (node-postgres) with explicit transactions
- Validation: Zod
- Logging: pino (structured)
- Testing: Vitest or Jest + supertest
- Auth: OAuth 2.0 / OIDC provider (Authorization Code + PKCE)

Rule: persistence is an infrastructure detail behind repositories; domain/application layers must not depend on `pg`.

---

## Architecture: DDD + Clean Architecture (non-negotiable)
- **Domain**: Entities, Value Objects, Aggregates, Domain Services, Domain Events
- **Application**: Use cases (commands/queries), transaction boundaries, orchestration
- **Infrastructure**: Postgres repositories, SQL, OAuth client integration, message bus/outbox
- **Interface/Delivery**: HTTP routes/controllers, validation, presenters

Dependency direction points inward (frameworks and DB are details).

---

## TDD Standards (required)
### Red–Green–Refactor Loop
1. Red: write a failing test that states a rule/behavior
2. Green: implement the simplest code to pass
3. Refactor: improve structure without changing behavior

### What to test
- Domain tests: invariants, value objects, aggregate behaviors, domain events raised
- Use case tests: orchestration, repo interactions via interfaces, authorization decisions
- Integration tests: repository SQL correctness, transactions, constraints
- HTTP tests: validation, auth plumbing, status codes/response shapes

Rules:
- Prefer unit tests for domain/use cases; keep HTTP/controllers thin.
- DB integration tests should use a real Postgres (container) for correctness.
- Every bug fix must add a regression test first.

---

## OAuth / OIDC Authentication Standards
- Prefer OIDC when available.
- Use Authorization Code + PKCE.
- Verify JWTs on every request (JWKS signature + `iss`/`aud`/`exp`).
- Enforce scopes/roles/permissions; authorization decisions belong in use cases/services.

Domain model:
- `User` aggregate (your identity)
- `OAuthIdentity` (provider + subject) linked to User

---

## Postgres: High-Performance Practices (Kleppmann-aligned)
- Measure p50/p95/p99 latency, not averages.
- Connection limits are real: use pooling and keep transactions short.
- Index for real access patterns; use `EXPLAIN (ANALYZE, BUFFERS)` on hot paths.
- Avoid N+1; batch queries.
- Avoid dual writes: prefer outbox/log-style single-write + async derive.
- Cache deliberately; avoid correctness depending on best-effort invalidation.
- Partition/shard only when required and avoid hotspots.

---

## Persistence without an ORM
- Domain/Application define repository interfaces (ports): `UserRepo`, `OAuthIdentityRepo`, `SessionRepo`
- Infrastructure implements via SQL + `pg`.
- Domain objects are persistence-ignorant; use explicit mappers.
- Use cases define transaction scope; keep it tight.

### Migrations (since no ORM)
Use an explicit migration tool. Defaults (pick one and be consistent):
- `dbmate` (simple, SQL-first)
- `node-pg-migrate` (JS/TS-based)
- `sqitch` (advanced)

Rules:
- Migrations are idempotent and versioned.
- Add DB constraints mirroring invariants (UNIQUE provider+subject, FKs, NOT NULL).
- Provide `migrate up` in CI and on Render deploy (see Render section).

---

## Linting, Formatting, and Type Checking (required quality gates)

### TypeScript strictness (default)
- Keep `strict: true`
- Prefer explicit return types for exported functions in domain/application
- No `any` unless justified; prefer `unknown` + narrowing

Suggested tsconfig posture:
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- `useUnknownInCatchVariables: true`
- `skipLibCheck: true` (acceptable for speed)

### ESLint + Prettier
Enforce:
- no floating promises / misused promises
- unused vars/imports as errors
- prefer `const`
- ban `console.*` (use logger)
- architecture boundaries (domain must not import infra, etc.)

### Scripts (expected)
- `lint`
- `format`
- `format:check`
- `typecheck` (`tsc --noEmit`)
- `test`
- `test:watch`
- `ci` (typecheck + lint + format:check + test)

### CI gates (non-negotiable)
PR must pass:
- typecheck
- lint
- format:check
- tests

---

## Hosting on Render (required operational standards)

### Runtime & process model
- Listen on `process.env.PORT` (Render injects it).
- Provide a fast `/health` endpoint (200 OK if process is alive).
- Optionally provide `/ready` (checks DB connectivity) with a short timeout.

### Environment variables (Render)
Do not hardcode secrets. Expect these to exist:
- `NODE_ENV`
- `PORT`
- `DATABASE_URL` (Render Postgres connection string)
- OAuth:
  - `OAUTH_ISSUER` (or provider base URL)
  - `OAUTH_CLIENT_ID`
  - `OAUTH_CLIENT_SECRET` (confidential clients only)
  - `OAUTH_REDIRECT_URI`
  - `OAUTH_AUDIENCE` (if applicable)
  - `OAUTH_SCOPES`
- App:
  - `LOG_LEVEL`
  - `CORS_ALLOWLIST` (comma-separated)

Rules:
- Log config at startup, but **never log secrets**.
- Fail fast if required env vars are missing.

### Build / Start commands (typical)
- Build: `npm ci && npm run build`
- Start: `npm run start` (should run compiled JS, not ts-node, in prod)

### Migrations on deploy
Since there’s no ORM, migrations must still run:
- Recommended: run migrations in the Render deploy pipeline (Build or Pre-Deploy step).
- If using a Build command, include:
  - `npm run migrate:up` before starting the server (or a separate predeploy hook)
- Migrations must be safe to run once per deploy (no destructive surprises).

### Postgres on Render
- Use connection pooling (node-postgres Pool).
- Set timeouts and keep transactions short.
- Avoid holding a DB connection while calling the OAuth provider.

### Graceful shutdown
Render may send SIGTERM during deploys:
- Stop accepting new requests
- Close server
- Close DB pool
- Exit cleanly

---

## GitHub PR Workflow (required)

### Branching
- Use short-lived branches off `main`:
  - `feat/...`, `fix/...`, `chore/...`, `perf/...`, `docs/...`
- Keep PRs small and reviewable (single theme).

### PR requirements
Each PR must include:
- Clear description: what/why/how
- Tests added/updated (or explicit justification)
- Any schema/migration changes + rollback notes
- Observability notes if new endpoints/queries were added (logs/metrics)

### Commit conventions (recommended)
- Conventional commits (optional but helpful):
  - `feat: ...`, `fix: ...`, `chore: ...`, `test: ...`, `perf: ...`

### Automated checks (GitHub Actions)
On every PR, run:
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm test`

Block merge unless checks are green.

### Review checklist (what to flag)
- Domain logic in controllers
- Missing tests (domain/use case)
- Long transactions or holding DB connections during network calls
- No indexes / no EXPLAIN evidence for hot query changes
- Dual writes without outbox/log
- AuthZ checks only in middleware
- Weakening tsconfig strictness or suppressing lint without reason

---

## API Standards (summary)
- Validate all inputs.
- Consistent response shapes:
  - `{ "data": ... }` success
  - `{ "error": { code, message, details?, requestId } }` error
- Central error handling; no stack traces in prod responses.
- Structured logs with redaction.

 