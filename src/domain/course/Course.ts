import { AggregateRoot } from '../shared/AggregateRoot.js';
import { UniqueEntityID } from '../shared/UniqueEntityID.js';
import { Result } from '../shared/Result.js';
import { CourseName } from './valueObjects/CourseName.js';
import { CourseDescription } from './valueObjects/CourseDescription.js';
import { CourseStatus } from './valueObjects/CourseStatus.js';
import type { CourseProps } from './CourseProps.js';

interface CreateCourseInput {
  name: string;
  description?: string;
  status?: string;
}

interface UpdateCourseInput {
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

export class Course extends AggregateRoot<CourseProps> {
  get name(): CourseName {
    return this.props.name;
  }

  get description(): CourseDescription {
    return this.props.description;
  }

  get status(): CourseStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: CourseProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(input: CreateCourseInput): Result<Course> {
    const nameResult = CourseName.create(input.name);
    if (nameResult.isFailure) return Result.fail(nameResult.errorValue);

    const descResult = CourseDescription.create(input.description);
    if (descResult.isFailure) return Result.fail(descResult.errorValue);

    const statusResult = CourseStatus.create(input.status);
    if (statusResult.isFailure) return Result.fail(statusResult.errorValue);

    const now = new Date();
    return Result.ok(
      new Course({
        name: nameResult.value,
        description: descResult.value,
        status: statusResult.value,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static reconstitute(input: ReconstituteInput, id: UniqueEntityID): Course {
    return new Course(
      {
        name: CourseName.reconstitute(input.name),
        description: CourseDescription.reconstitute(input.description),
        status: CourseStatus.reconstitute(input.status as 'active' | 'archived'),
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      },
      id,
    );
  }

  update(input: UpdateCourseInput): Result<Course> {
    const nameResult =
      input.name !== undefined ? CourseName.create(input.name) : Result.ok(this.props.name);
    if (nameResult.isFailure) return Result.fail(nameResult.errorValue);

    const descResult =
      input.description !== undefined
        ? CourseDescription.create(input.description)
        : Result.ok(this.props.description);
    if (descResult.isFailure) return Result.fail(descResult.errorValue);

    const statusResult =
      input.status !== undefined ? CourseStatus.create(input.status) : Result.ok(this.props.status);
    if (statusResult.isFailure) return Result.fail(statusResult.errorValue);

    return Result.ok(
      new Course(
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
