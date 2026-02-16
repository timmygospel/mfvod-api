import { describe, it, expect } from 'vitest';
import { Result } from '../Result.js';

describe('Result', () => {
  describe('ok', () => {
    it('should create a successful result with a value', () => {
      const result = Result.ok<number>(42);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe(42);
    });

    it('should create a successful result without a value', () => {
      const result = Result.ok();

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
    });
  });

  describe('fail', () => {
    it('should create a failed result with an error message', () => {
      const result = Result.fail<number>('something went wrong');

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toBe('something went wrong');
    });

    it('should throw when accessing value on a failed result', () => {
      const result = Result.fail<number>('oops');

      expect(() => result.value).toThrow();
    });
  });

  describe('combine', () => {
    it('should return ok when all results are successful', () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];

      const combined = Result.combine(results);

      expect(combined.isSuccess).toBe(true);
    });

    it('should return the first failure when any result fails', () => {
      const results = [Result.ok(1), Result.fail('first error'), Result.fail('second error')];

      const combined = Result.combine(results);

      expect(combined.isFailure).toBe(true);
      expect(combined.errorValue).toBe('first error');
    });

    it('should return ok for an empty array', () => {
      const combined = Result.combine([]);

      expect(combined.isSuccess).toBe(true);
    });
  });
});
