import type { CategoryName } from './valueObjects/CategoryName.js';
import type { CategoryDescription } from './valueObjects/CategoryDescription.js';
import type { CategoryStatus } from './valueObjects/CategoryStatus.js';

export interface CategoryProps {
  name: CategoryName;
  description: CategoryDescription;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}
