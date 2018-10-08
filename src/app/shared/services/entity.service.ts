import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Entity } from '@shared/models/entity';

@Injectable()
export class EntityService {
  protected entity: string;
  protected entitiesSubject: BehaviorSubject<Entity[]> = new BehaviorSubject<Entity[]>([]);

  constructor() {}

  bind(): Observable<Entity[]> {
    return this.entitiesSubject.asObservable();
  }

  bindFromId(id: string): Observable<Entity> {
    return this.bind().pipe(map(entities => entities.find(entity => entity.id === id)));
  }

  add(entity: Entity): void {
    const entities = this.entitiesSubject.getValue();
    entities.push(entity);
    this.update(entities);
  }

  edit(entity: Entity): void {
    const entities = this.entitiesSubject.getValue();
    if (this.get(entity.id, entities).entity) {
      entities[this.get(entity.id, entities).index] = entity;
    }

    this.update(entities);
  }

  editById<T>(entityId: string, editFunction: Function) {
    const entity = this.get(entityId, this.entitiesSubject.getValue()).entity;
    this.edit(editFunction(entity));
  }

  delete(id: string): void {
    const entities = this.entitiesSubject.getValue();
    if (this.get(id, entities).entity) {
      entities.splice(this.get(id, entities).index, 1);
    }
    this.update(entities);
  }

  reset(): void {
    this.update([]);
  }

  getNewColor(): number {
    const existingItems = this.entitiesSubject.getValue();
    for (let index = 1; index < 99; index++) {
      if (existingItems.map(item => item.color).indexOf(index) === -1) {
        return index;
      }
    }
  }

  bindAvailableColors(length: number): Observable<number[]> {
    return this.bind().pipe(map(entities => {
      const takenColors = entities.map(entity => entity.color);
      const allColors = [];
      for (let index = 1; index < length + 1; index++) {
        allColors[index] = index;
      }
      return this.arrayDiff(allColors, takenColors);
    }));
  }

  protected get(id: string, entities: Entity[]): {entity: Entity, index: number} {
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
    try {
      window.localStorage.setItem(this.entity, JSON.stringify(entities));
    } catch (e) {
      console.error('This browser does not support local storage');
    }
    this.entitiesSubject.next(entities);
  }

  protected arrayDiff(longArray: any[], shortArray: any[]): any[] {
    return longArray.filter(i => shortArray.indexOf(i) < 0);
  }
}
