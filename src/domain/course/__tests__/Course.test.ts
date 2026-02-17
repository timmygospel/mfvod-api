import { describe, it, expect } from 'vitest';
import { Course } from '../Course.js';
import { UniqueEntityID } from '../../shared/UniqueEntityID.js';

describe('Course', () => {
  it('should create a valid course', () => {
    const result = Course.create({ name: 'DDD Fundamentals' });
    expect(result.isSuccess).toBe(true);

    const course = result.value;
    expect(course.name.value).toBe('DDD Fundamentals');
    expect(course.description.value).toBe('');
    expect(course.status.value).toBe('active');
    expect(course.createdAt).toBeInstanceOf(Date);
    expect(course.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a course with all props', () => {
    const result = Course.create({
      name: 'Advanced DDD',
      description: 'Deep dive into DDD',
      status: 'archived',
    });
    expect(result.isSuccess).toBe(true);

    const course = result.value;
    expect(course.name.value).toBe('Advanced DDD');
    expect(course.description.value).toBe('Deep dive into DDD');
    expect(course.status.value).toBe('archived');
  });

  it('should fail when name is invalid', () => {
    const result = Course.create({ name: '' });
    expect(result.isFailure).toBe(true);
  });

  it('should fail when description is too long', () => {
    const result = Course.create({ name: 'Valid', description: 'a'.repeat(2001) });
    expect(result.isFailure).toBe(true);
  });

  it('should reconstitute from persistence', () => {
    const id = new UniqueEntityID();
    const now = new Date();
    const course = Course.reconstitute(
      {
        name: 'Reconstituted',
        description: 'From DB',
        status: 'archived',
        createdAt: now,
        updatedAt: now,
      },
      id,
    );

    expect(course.id.equals(id)).toBe(true);
    expect(course.name.value).toBe('Reconstituted');
    expect(course.description.value).toBe('From DB');
    expect(course.status.value).toBe('archived');
    expect(course.createdAt).toBe(now);
    expect(course.updatedAt).toBe(now);
  });

  it('should update fields and bump updatedAt', () => {
    const createResult = Course.create({ name: 'Original' });
    const course = createResult.value;
    const originalUpdatedAt = course.updatedAt;

    const updateResult = course.update({ name: 'Updated Name', status: 'archived' });
    expect(updateResult.isSuccess).toBe(true);

    const updated = updateResult.value;
    expect(updated.name.value).toBe('Updated Name');
    expect(updated.status.value).toBe('archived');
    expect(updated.description.value).toBe('');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
  });

  it('should fail update with invalid name', () => {
    const course = Course.create({ name: 'Original' }).value;
    const result = course.update({ name: '' });
    expect(result.isFailure).toBe(true);
  });

  it('should support equality by id', () => {
    const id = new UniqueEntityID();
    const a = Course.reconstitute(
      {
        name: 'A',
        description: '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
    const b = Course.reconstitute(
      {
        name: 'B',
        description: '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
    expect(a.equals(b)).toBe(true);
  });
});
