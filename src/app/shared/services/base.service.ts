import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Player } from '@shared/models/player';
import { EntityService } from '@shared/services/entity.service';
import { Base } from '@shared/models/base';
import { MAX_PLAYERS, CREATURE_CARD_SIZE, BASE_CARD_SIZE } from '@shared/constants';
import { PlayerService } from '@shared/services/player.service';
import { CreatureService } from '@shared/services/creature.service';
import { Creature } from '@shared/models/creature';
import { Score } from '@shared/interfaces/score';
import { localStorage } from '@shared/utils/localStorage';
import { CreatureOrderedList } from '@shared/interfaces/creatureOrderedList';
import { position } from '@shared/utils/position';

@Injectable()
export class BaseService extends EntityService {
  protected entity = 'bases';

  constructor(
    private playerService: PlayerService,
    private creatureService: CreatureService
  ) {
    super();
    const bases = localStorage.get<Base[]>(this.entity);

    if (bases) {
      this.entities$.next(bases);
    }

    this.creatureService.deleteCreatureEvent$.subscribe(creatureId => this.removeCreature(creatureId));
  }

  bind(): Observable<Base[]> {
    return combineLatest(
      super.bind(),
      this.playerService.bind(),
      this.creatureService.bind()
    ).pipe(map(([bases, players, creatures]) => bases.map((base: Base) => {
      base.scores = this.getScores(base, players, creatures);
      base.resistance = this.getResistance(base, creatures);
      return base;
    })));
  }

  bindIsHovered(baseId: string): Observable<boolean> {
    return combineLatest(
      this.creatureService.bindDragging(),
      this.creatureService.bindDraggingCoordinates(),
      this.bind()
    ).pipe(map(([creatureDraggingId, draggingCoordinates, bases]) => {
      if (!creatureDraggingId || !draggingCoordinates) {
        return false;
      }
      const selectedBase = this.get(baseId).entity as Base;
      return position.isSuperposing(
        {itemId: creatureDraggingId, x: draggingCoordinates[0], y: draggingCoordinates[1], width: CREATURE_CARD_SIZE[0], height: CREATURE_CARD_SIZE[1]},
        {itemId: selectedBase.id, x: selectedBase.position.x, y: selectedBase.position.y, width: BASE_CARD_SIZE[0], height: BASE_CARD_SIZE[1]},
        bases.map(base => ({itemId: base.id, x: base.position.x, y: base.position.y, width: BASE_CARD_SIZE[0], height: BASE_CARD_SIZE[1]}))
      );
    }));
  }

  add(base: Base): void {
    const bases = this.entities$.getValue();
    if (bases.length < MAX_PLAYERS + 1) {
      base.color = this.getNewColor();
      super.add(base);
    }
  }

  conquer(base: Base): void {
    const sortedScores = base.scores.sort((scoreA, scoreB) => {
      return scoreB.score - scoreA.score;
    });

    let rewardIndex = 0;
    let scoreIndex = 0;
    while (rewardIndex < base.rewards.length && scoreIndex < sortedScores.length) {
      const basisScore = sortedScores[scoreIndex];
      basisScore.reward = base.rewards[rewardIndex];
      scoreIndex ++;

      while (scoreIndex < sortedScores.length) {
        if (sortedScores[scoreIndex].score === basisScore.score) {
          sortedScores[scoreIndex].reward = base.rewards[rewardIndex];
          scoreIndex ++;
        } else {
          rewardIndex = scoreIndex;
          break;
        }
      }
    }

    sortedScores.forEach(score => {
      this.playerService.updateScore(score.reward, score.playerId, true);
    });

    this.delete(base.id);
  }

  delete(baseId: string) {
    const base = this.get(baseId).entity as Base;
    let i = base.creatures.length;
    while (i--) {
      this.creatureService.delete(base.creatures[i]);
    }
    super.delete(baseId);
  }

  createCreature(creature: Creature, baseId: string) {
    this.creatureService.add(creature);
    this.addCreature(creature.id, baseId);
  }

  moveCreatureToAnotherBase(creatureId: string, newBaseId: string) {
    this.removeCreature(creatureId);
    this.addCreature(creatureId, newBaseId);
  }

  getCreatureOrderedList(baseId: string): Observable<CreatureOrderedList> {
    return combineLatest(
      this.bind(),
      this.creatureService.bind(),
      this.playerService.bind()
    ).pipe(map(([bases, creatures, players]) => {
      const baseFromId = bases.find(base => base.id === baseId);

      const monsters = baseFromId && baseFromId.creatures
      .filter(creatureId => {
        const creatureFromId = creatures.find(creature => creature.id === creatureId);
        return creatureFromId && creatureFromId.ownerId === 'monster';
      });

      const creatureOwners = players.map(player => {
        const creaturesFromThisOwner = baseFromId && baseFromId.creatures.filter(creatureId => {
          const creatureFromId = creatures.find(creature => creature.id === creatureId);
          return creatureFromId && creatureFromId.ownerId === player.id;
        });
        return {
          creatures: creaturesFromThisOwner,
          player: player
        };
      }).filter(creatureOwner => creatureOwner && creatureOwner.creatures && creatureOwner.creatures.length > 0);

      return {players: creatureOwners, monsters};
    }));
  }

  private addCreature(creatureId: string, baseId: string) {
    this.editById(baseId, (base: Base) => {
      base.creatures.push(creatureId);
      return base;
    });
  }

  private removeCreature(creatureId: string) {
    for (const base of this.entities$.getValue() as Base[]) {
      const creatureIndex = base.creatures.findIndex(baseCreatureId => baseCreatureId === creatureId);
      if (creatureIndex !== -1) {
        base.creatures.splice(creatureIndex, 1);
        this.edit(base);
        break;
      }
    }
  }

  private getResistance(base: Base, creatures: Creature[]): number {
    let resistance = base.maxResistance - base.scores.map(score => score.score).reduce((previous, score) => previous + score, 0);

    // add monsters strength to the base resistance
    resistance += base.creatures
      .map(creatureId => creatures.find(creature => creature.id === creatureId))
      .filter(creature => creature && creature.ownerId === 'monster')
      .reduce((previous, monster) => previous + monster.strength, 0);

    return resistance;
  }

  private getScores(base: Base, players: Player[], creatures: Creature[]): Score[] {
    return players.map(player => {
      const creaturesOfThisPlayer = base.creatures
        .map(creatureId => creatures.find(creature => creature.id === creatureId))
        .filter(creature => creature && creature.ownerId === player.id);

      let score = null;
      if (creaturesOfThisPlayer.length > 0) {
        score = creaturesOfThisPlayer
          .reduce((previousScore, creature) => previousScore + creature.strength, 0);
      }

      return {
        playerId: player.id,
        score
      };
    }).filter(score => score.score !== null);
  }
}
