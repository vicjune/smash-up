import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Entity } from '@shared/models/entity';
import { localStorage } from '@shared/utils/localStorage';

@Injectable()
export class EntityService {
  protected entity: string;
  protected entities$: BehaviorSubject<Entity[]> = new BehaviorSubject<Entity[]>([]);

  constructor() {}

  bind(): Observable<Entity[]> {
    return this.entities$.asObservable();
  }

  bindFromId(id: string): Observable<Entity> {
    return this.bind().pipe(map(entities => entities.find(entity => entity.id === id)));
  }

  add(entity: Entity): void {
    const entities = this.entities$.getValue();
    entities.push(entity);
    this.update(entities);
  }

  edit(entity: Entity): void {
    const entities = this.entities$.getValue();
    if (this.get(entity.id).entity) {
      entities[this.get(entity.id).index] = entity;
    }
    this.update(entities);
  }

  editById(entityId: string, editFunction: (entity: Entity) => Entity) {
    const entity = this.get(entityId).entity;
    this.edit(editFunction(entity));
  }

  delete(id: string): void {
    const entities = this.entities$.getValue();
    if (this.get(id).entity) {
      entities.splice(this.get(id).index, 1);
    }
    this.update(entities);
  }

  reset(): void {
    this.update([]);
  }

  getNewColor(): number {
    const existingItems = this.entities$.getValue();
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

  protected get(id: string): {entity: Entity, index: number} {
    const entities = this.entities$.getValue();
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
    localStorage.set(this.entity, entities);
    this.entities$.next(entities);
  }

  protected arrayDiff(longArray: any[], shortArray: any[]): any[] {
    return longArray.filter(i => shortArray.indexOf(i) < 0);
  }
}
