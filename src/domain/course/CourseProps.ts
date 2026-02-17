import type { CourseName } from './valueObjects/CourseName.js';
import type { CourseDescription } from './valueObjects/CourseDescription.js';
import type { CourseStatus } from './valueObjects/CourseStatus.js';

export interface CourseProps {
  name: CourseName;
  description: CourseDescription;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}
