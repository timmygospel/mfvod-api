import { describe, it, expect } from 'vitest';
import { Category } from '../Category.js';
import { UniqueEntityID } from '../../shared/UniqueEntityID.js';

describe('Category', () => {
  it('should create a valid category', () => {
    const result = Category.create({ name: 'Web Development' });
    expect(result.isSuccess).toBe(true);

    const category = result.value;
    expect(category.name.value).toBe('Web Development');
    expect(category.description.value).toBe('');
    expect(category.status.value).toBe('active');
    expect(category.createdAt).toBeInstanceOf(Date);
    expect(category.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a category with all props', () => {
    const result = Category.create({
      name: 'Design',
      description: 'Courses about design',
      status: 'archived',
    });
    expect(result.isSuccess).toBe(true);

    const category = result.value;
    expect(category.name.value).toBe('Design');
    expect(category.description.value).toBe('Courses about design');
    expect(category.status.value).toBe('archived');
  });

  it('should fail when name is invalid', () => {
    const result = Category.create({ name: '' });
    expect(result.isFailure).toBe(true);
  });

  it('should fail when description is too long', () => {
    const result = Category.create({ name: 'Valid', description: 'a'.repeat(2001) });
    expect(result.isFailure).toBe(true);
  });

  it('should reconstitute from persistence', () => {
    const id = new UniqueEntityID();
    const now = new Date();
    const category = Category.reconstitute(
      {
        name: 'Reconstituted',
        description: 'From DB',
        status: 'archived',
        createdAt: now,
        updatedAt: now,
      },
      id,
    );

    expect(category.id.equals(id)).toBe(true);
    expect(category.name.value).toBe('Reconstituted');
    expect(category.description.value).toBe('From DB');
    expect(category.status.value).toBe('archived');
    expect(category.createdAt).toBe(now);
    expect(category.updatedAt).toBe(now);
  });

  it('should update fields and bump updatedAt', () => {
    const createResult = Category.create({ name: 'Original' });
    const category = createResult.value;
    const originalUpdatedAt = category.updatedAt;

    const updateResult = category.update({ name: 'Updated Name', status: 'archived' });
    expect(updateResult.isSuccess).toBe(true);

    const updated = updateResult.value;
    expect(updated.name.value).toBe('Updated Name');
    expect(updated.status.value).toBe('archived');
    expect(updated.description.value).toBe('');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
  });

  it('should fail update with invalid name', () => {
    const category = Category.create({ name: 'Original' }).value;
    const result = category.update({ name: '' });
    expect(result.isFailure).toBe(true);
  });

  it('should support equality by id', () => {
    const id = new UniqueEntityID();
    const a = Category.reconstitute(
      {
        name: 'A',
        description: '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
    const b = Category.reconstitute(
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
