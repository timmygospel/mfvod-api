import { AggregateRoot } from '../shared/AggregateRoot.js';
import { UniqueEntityID } from '../shared/UniqueEntityID.js';
import { Result } from '../shared/Result.js';
import { CategoryName } from './valueObjects/CategoryName.js';
import { CategoryDescription } from './valueObjects/CategoryDescription.js';
import { CategoryStatus } from './valueObjects/CategoryStatus.js';
import type { CategoryProps } from './CategoryProps.js';

interface CreateCategoryInput {
  name: string;
  description?: string;
  status?: string;
}

interface UpdateCategoryInput {
  name?: string;
  description?: string;
  status?: string;
}

interface ReconstituteInput {
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Category extends AggregateRoot<CategoryProps> {
  get name(): CategoryName {
    return this.props.name;
  }

  get description(): CategoryDescription {
    return this.props.description;
  }

  get status(): CategoryStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: CategoryProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(input: CreateCategoryInput): Result<Category> {
    const nameResult = CategoryName.create(input.name);
    if (nameResult.isFailure) return Result.fail(nameResult.errorValue);

    const descResult = CategoryDescription.create(input.description);
    if (descResult.isFailure) return Result.fail(descResult.errorValue);

    const statusResult = CategoryStatus.create(input.status);
    if (statusResult.isFailure) return Result.fail(statusResult.errorValue);

    const now = new Date();
    return Result.ok(
      new Category({
        name: nameResult.value,
        description: descResult.value,
        status: statusResult.value,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static reconstitute(input: ReconstituteInput, id: UniqueEntityID): Category {
    return new Category(
      {
        name: CategoryName.reconstitute(input.name),
        description: CategoryDescription.reconstitute(input.description),
        status: CategoryStatus.reconstitute(input.status as 'active' | 'archived'),
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      },
      id,
    );
  }

  update(input: UpdateCategoryInput): Result<Category> {
    const nameResult =
      input.name !== undefined ? CategoryName.create(input.name) : Result.ok(this.props.name);
    if (nameResult.isFailure) return Result.fail(nameResult.errorValue);

    const descResult =
      input.description !== undefined
        ? CategoryDescription.create(input.description)
        : Result.ok(this.props.description);
    if (descResult.isFailure) return Result.fail(descResult.errorValue);

    const statusResult =
      input.status !== undefined ? CategoryStatus.create(input.status) : Result.ok(this.props.status);
    if (statusResult.isFailure) return Result.fail(statusResult.errorValue);

    return Result.ok(
      new Category(
        {
          name: nameResult.value,
          description: descResult.value,
          status: statusResult.value,
          createdAt: this.props.createdAt,
          updatedAt: new Date(),
        },
        this._id,
      ),
    );
  }
}
