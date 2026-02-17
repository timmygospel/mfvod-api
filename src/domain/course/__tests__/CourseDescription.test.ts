import { describe, it, expect } from 'vitest';
import { CourseDescription } from '../valueObjects/CourseDescription.js';

describe('CourseDescription', () => {
  it('should create a valid description', () => {
    const result = CourseDescription.create('A great course about DDD');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('A great course about DDD');
  });

  it('should allow an empty description', () => {
    const result = CourseDescription.create('');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('');
  });

  it('should allow undefined (defaults to empty)', () => {
    const result = CourseDescription.create(undefined);
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('');
  });

  it('should fail when description exceeds 2000 characters', () => {
    const result = CourseDescription.create('a'.repeat(2001));
    expect(result.isFailure).toBe(true);
  });

  it('should accept description at the max boundary (2000 chars)', () => {
    const result = CourseDescription.create('a'.repeat(2000));
    expect(result.isSuccess).toBe(true);
  });
});
