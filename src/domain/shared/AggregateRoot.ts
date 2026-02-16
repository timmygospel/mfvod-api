import type { DomainEvent } from './DomainEvent.js';
import { Entity } from './Entity.js';
import type { UniqueEntityID } from './UniqueEntityID.js';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  override get id(): UniqueEntityID {
    return this._id;
  }
}
