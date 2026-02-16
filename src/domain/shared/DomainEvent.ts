import { UniqueEntityID } from './UniqueEntityID.js';

export interface DomainEvent {
  readonly dateTimeOccurred: Date;
  getAggregateId(): UniqueEntityID;
}
