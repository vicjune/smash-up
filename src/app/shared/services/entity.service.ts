import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Entity } from '@shared/models/entity';
import { localStorage } from '@shared/utils/localStorage';
import { arrayUtils } from '@shared/utils/arrayUtils';

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

  bindAllEntities() {
    return this.bindList().pipe(
      switchMap(entitiesId => combineLatest(...entitiesId.map(entityId => this.bindFromId(entityId))))
    );
  }

  add(entity: Entity): void {
    this.entities$[entity.id] = new BehaviorSubject<Entity>(entity);
    const entityList = this.entityList$.getValue();
    entityList.push(entity.id);
    this.entityList$.next(entityList);
    this.updateLocalStorage();
  }

  edit(entityId: string, editFunction: (entity: Entity) => Entity) {
    let entity = entityId && this.entities$[entityId].getValue();
    if (entity) {
      entity = editFunction(entity);
      this.entities$[entity.id].next(entity);
      this.updateLocalStorage();
    }
  }

  delete(id: string): void {
    const entityList = arrayUtils.delete(id, this.entityList$.getValue());
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
      this.entityList$.next(entities.map(entity => entity.id));
      entities.forEach(entity => {
        this.entities$[entity.id] = new BehaviorSubject<Entity>(entity);
      });
    }
  }
}
