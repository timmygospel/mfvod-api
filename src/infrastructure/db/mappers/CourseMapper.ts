import { Course } from '../../../domain/course/Course.js';
import { UniqueEntityID } from '../../../domain/shared/UniqueEntityID.js';

export interface CoursePersistence {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export interface CourseDTO {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export class CourseMapper {
  static toDomain(raw: CoursePersistence): Course {
    return Course.reconstitute(
      {
        name: raw.name,
        description: raw.description,
        status: raw.status,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(course: Course): CoursePersistence {
    return {
      id: course.id.toValue(),
      name: course.name.value,
      description: course.description.value,
      status: course.status.value,
      created_at: course.createdAt,
      updated_at: course.updatedAt,
    };
  }

  static toDTO(course: Course): CourseDTO {
    return {
      id: course.id.toValue(),
      name: course.name.value,
      description: course.description.value,
      status: course.status.value,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }
}
