import { describe, it, expect } from 'vitest';
import { VideoDescription } from '../valueObjects/VideoDescription.js';

describe('VideoDescription', () => {
  it('should create a valid description', () => {
    const result = VideoDescription.create('Learn about DDD');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('Learn about DDD');
  });

  it('should default to empty string when undefined', () => {
    const result = VideoDescription.create();
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('');
  });

  it('should fail when description exceeds 2000 characters', () => {
    const result = VideoDescription.create('a'.repeat(2001));
    expect(result.isFailure).toBe(true);
  });

  it('should accept a description at the max boundary (2000 chars)', () => {
    const result = VideoDescription.create('a'.repeat(2000));
    expect(result.isSuccess).toBe(true);
  });

  it('should support equality comparison', () => {
    const a = VideoDescription.create('Same text').value;
    const b = VideoDescription.create('Same text').value;
    expect(a.equals(b)).toBe(true);
  });
});
