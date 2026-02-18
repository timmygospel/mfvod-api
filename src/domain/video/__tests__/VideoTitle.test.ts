import { describe, it, expect } from 'vitest';
import { VideoTitle } from '../valueObjects/VideoTitle.js';

describe('VideoTitle', () => {
  it('should create a valid video title', () => {
    const result = VideoTitle.create('Introduction to DDD');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('Introduction to DDD');
  });

  it('should trim whitespace', () => {
    const result = VideoTitle.create('  DDD Video  ');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('DDD Video');
  });

  it('should fail when title is empty', () => {
    const result = VideoTitle.create('');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when title is only whitespace', () => {
    const result = VideoTitle.create('   ');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when title is shorter than 3 characters', () => {
    const result = VideoTitle.create('ab');
    expect(result.isFailure).toBe(true);
  });

  it('should fail when title exceeds 100 characters', () => {
    const result = VideoTitle.create('a'.repeat(101));
    expect(result.isFailure).toBe(true);
  });

  it('should accept a title at the max boundary (100 chars)', () => {
    const result = VideoTitle.create('a'.repeat(100));
    expect(result.isSuccess).toBe(true);
  });

  it('should support equality comparison', () => {
    const a = VideoTitle.create('DDD Video').value;
    const b = VideoTitle.create('DDD Video').value;
    expect(a.equals(b)).toBe(true);
  });
});
