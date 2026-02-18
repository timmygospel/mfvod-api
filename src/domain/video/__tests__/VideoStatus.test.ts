import { describe, it, expect } from 'vitest';
import { VideoStatus } from '../valueObjects/VideoStatus.js';

describe('VideoStatus', () => {
  it('should default to active', () => {
    const result = VideoStatus.create();
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('active');
  });

  it('should accept active', () => {
    const result = VideoStatus.create('active');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('active');
  });

  it('should accept archived', () => {
    const result = VideoStatus.create('archived');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('archived');
  });

  it('should accept disabled', () => {
    const result = VideoStatus.create('disabled');
    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('disabled');
  });

  it('should fail for invalid status', () => {
    const result = VideoStatus.create('draft');
    expect(result.isFailure).toBe(true);
  });

  it('should support equality comparison', () => {
    const a = VideoStatus.create('active').value;
    const b = VideoStatus.create('active').value;
    expect(a.equals(b)).toBe(true);
  });
});
