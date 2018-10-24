import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Entity } from '@shared/models/entity';
import { localStorage } from '@shared/utils/localStorage';

@Injectable()
export class EntityService {
  protected entity: string;
  protected entities$ = {};
  protected entityList$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor() {}

  bindFromId(id: string): Observable<Entity> {
    return this.entities$[id] ? this.entities$[id].asObservable() : of(null);
  }

  bindList(): Observable<string[]> {
    return this.entityList$.asObservable();
  }

  bindAllEntities(): Observable<Entity[]> {
    return this.bindList().pipe(
      switchMap(entitiesId => {
        if (entitiesId.length === 0) {
          return of([]);
        }
        return combineLatest(...entitiesId.map(entityId => this.bindFromId(entityId)));
      })
    );
  }

  add(entity: Entity): void {
    this.entities$[entity.id] = new BehaviorSubject<Entity>(entity);
    const entityList = this.entityList$.getValue();
    entityList.push(entity.id);
    this.entityList$.next(entityList);
    this.updateLocalStorage();
  }

  edit(entityId: string, editFunction: (entity: Entity) => Entity): void {
    let entity = entityId && this.entities$[entityId] && this.entities$[entityId].getValue();
    if (entity) {
      entity = editFunction(entity);
      this.entities$[entity.id].next(entity);
      this.updateLocalStorage();
    }
  }

  delete(id: string): void {
    const entityList = this.entityList$.getValue();
    const index = entityList.findIndex(element => element === id);
    if (index !== -1) {
      entityList.splice(index, 1);
    }
    this.entityList$.next(entityList);
    delete this.entities$[id];
    this.updateLocalStorage();
  }

  reset(): void {
    this.entityList$.next([]);
    this.entities$ = {};
    this.updateLocalStorage();
  }

  protected getAllEntities(): Entity[] {
    return this.entityList$.getValue().map(entityId => this.getEntity(entityId));
  }

  protected getEntity(id: string): Entity {
    if (this.entities$[id]) {
      return this.entities$[id].getValue();
    }
    return null;
  }

  protected updateLocalStorage(): void {
    localStorage.set(this.entity, this.getAllEntities());
  }

  protected updateFromLocalStorage(entities: Entity[]): void {
    if (entities) {
      entities = entities.filter(entity => !!entity);
      entities.forEach(entity => {
        this.entities$[entity.id] = new BehaviorSubject<Entity>(entity);
      });
      this.entityList$.next(entities.map(entity => entity.id));
    }
  }
}
