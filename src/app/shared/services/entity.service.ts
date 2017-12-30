import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { Entity } from '@shared/models/entity';

@Injectable()
export class EntityService {
  protected entity: string;
  protected entitiesSubject: BehaviorSubject<Entity[]> = new BehaviorSubject<Entity[]>([]);

  constructor() {}

  bind(): Observable<Entity[]> {
    return this.entitiesSubject.asObservable();
  }

  add(entity: Entity): void {
    const entities = this.entitiesSubject.getValue();
    entities.push(entity);
    this.update(entities);
  }

  edit(entity: Entity): void {
    const entities = this.entitiesSubject.getValue();
    if (this.get(entity.id).entity) {
      entities[this.get(entity.id).index] = entity;
    }
    this.update(entities);
  }

  delete(id: string): void {
    const entities = this.entitiesSubject.getValue();
    if (this.get(id).entity) {
      entities.splice(this.get(id).index, 1);
    }
    this.update(entities);
  }

  resetGame(): void {
    this.update([]);
  }

  protected get(id: string): {entity: Entity, index: number} {
    const entities = this.entitiesSubject.getValue();
    const entityIndex = entities.map(ent => ent.id).indexOf(id);
    if (entityIndex !== -1) {
      return {
        entity: entities[entityIndex],
        index: entityIndex
      };
    }
    return {
      entity: null,
      index: null
    };
  }

  protected update(entities: Entity[]): void {
    window.localStorage.setItem(this.entity, JSON.stringify(entities));
    this.entitiesSubject.next(entities);
  }

  protected arrayDiff(longArray, shortArray) {
    return longArray.filter(i => shortArray.indexOf(i) < 0);
  }
}