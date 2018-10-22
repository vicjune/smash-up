import { Entity } from './entity';
import { Player } from '@shared/models/player';

export class Creature extends Entity {
  ownerId: string;
  strength: number;
  basicStrength: number;
  bonusStrength: number;
  modifierDuringOwnerTurn: number;
  rotation: number;

  constructor(ownerId: string, strength?: number) {
    super();
    this.ownerId = ownerId;
    this.basicStrength = strength || 0;
    this.bonusStrength = 0;
    this.modifierDuringOwnerTurn = 0;
    this.rotation = Math.random();
  }
}
