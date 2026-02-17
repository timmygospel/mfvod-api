import { describe, it, expect } from 'vitest';
import { CategoryName } from '../valueObjects/CategoryName.js';

describe('CategoryName', () => {
  it('should create a valid category name', () => {
    const result = CategoryName.create('Web Development');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('Web Development');
  });

  it('should trim whitespace', () => {
    const result = CategoryName.create('  Design  ');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('Design');
  });

  it('should fail when name is empty', () => {
    const result = CategoryName.create('');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when name is only whitespace', () => {
    const result = CategoryName.create('   ');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when name is shorter than 3 characters', () => {
    const result = CategoryName.create('ab');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when name exceeds 100 characters', () => {
    const result = CategoryName.create('a'.repeat(101));
    expect(result.isFailure).toBe(true);
  });

  it('should accept a name at the max boundary (100 chars)', () => {
    const result = CategoryName.create('a'.repeat(100));
    expect(result.isSuccess).toBe(true);
  });

  it('should support equality comparison', () => {
    const a = CategoryName.create('Design').value;
    const b = CategoryName.create('Design').value;
    expect(a.equals(b)).toBe(true);
  });
});
