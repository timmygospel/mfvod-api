import { describe, it, expect } from 'vitest';
import { CourseName } from '../valueObjects/CourseName.js';

describe('CourseName', () => {
  it('should create a valid course name', () => {
    const result = CourseName.create('Introduction to DDD');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('Introduction to DDD');
  });

  it('should trim whitespace', () => {
    const result = CourseName.create('  DDD Course  ');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('DDD Course');
  });

  it('should fail when name is empty', () => {
    const result = CourseName.create('');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when name is only whitespace', () => {
    const result = CourseName.create('   ');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when name is shorter than 3 characters', () => {
    const result = CourseName.create('ab');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when name exceeds 100 characters', () => {
    const result = CourseName.create('a'.repeat(101));
    expect(result.isFailure).toBe(true);
  });

  it('should accept a name at the max boundary (100 chars)', () => {
    const result = CourseName.create('a'.repeat(100));
    expect(result.isSuccess).toBe(true);
  });

  it('should support equality comparison', () => {
    const a = CourseName.create('DDD Course').value;
    const b = CourseName.create('DDD Course').value;
    expect(a.equals(b)).toBe(true);
  });
});
