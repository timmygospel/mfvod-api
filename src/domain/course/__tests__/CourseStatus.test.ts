import { describe, it, expect } from 'vitest';
import { CourseStatus } from '../valueObjects/CourseStatus.js';

describe('CourseStatus', () => {
  it('should create with "active" status', () => {
    const result = CourseStatus.create('active');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('active');
  });

  it('should create with "archived" status', () => {
    const result = CourseStatus.create('archived');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('archived');
  });

  it('should fail with an invalid status', () => {
    const result = CourseStatus.create('deleted' as 'active');
    expect(result.isFailure).toBe(true);
  });

  it('should default to "active" when no value provided', () => {
    const result = CourseStatus.create(undefined);
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('active');
  });
});
