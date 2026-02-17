import { describe, it, expect } from 'vitest';
import { CategoryDescription } from '../valueObjects/CategoryDescription.js';

describe('CategoryDescription', () => {
  it('should create a valid description', () => {
    const result = CategoryDescription.create('Courses about web development');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('Courses about web development');
  });

  it('should allow an empty description', () => {
    const result = CategoryDescription.create('');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('');
  });

  it('should allow undefined (defaults to empty)', () => {
    const result = CategoryDescription.create(undefined);
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('');
  });

  it('should fail when description exceeds 2000 characters', () => {
    const result = CategoryDescription.create('a'.repeat(2001));
    expect(result.isFailure).toBe(true);
  });

  it('should accept description at the max boundary (2000 chars)', () => {
    const result = CategoryDescription.create('a'.repeat(2000));
    expect(result.isSuccess).toBe(true);
  });
});
