import { describe, it, expect } from 'vitest';
import { CategoryStatus } from '../valueObjects/CategoryStatus.js';

describe('CategoryStatus', () => {
  it('should create with "active" status', () => {
    const result = CategoryStatus.create('active');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('active');
  });

  it('should create with "archived" status', () => {
    const result = CategoryStatus.create('archived');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('archived');
  });

  it('should fail with an invalid status', () => {
    const result = CategoryStatus.create('deleted' as 'active');
    expect(result.isFailure).toBe(true);
  });

  it('should default to "active" when no value provided', () => {
    const result = CategoryStatus.create(undefined);
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('active');
  });
});
