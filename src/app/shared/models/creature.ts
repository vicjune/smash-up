import { Entity } from './entity';

export class Creature extends Entity {
  ownerId: string;
  basicStrength: number;
  bonusStrength: number;
  modifierDuringOwnerTurn: number;

  constructor(ownerId: string, strength?: number) {
    super();
    this.ownerId = ownerId;
    this.basicStrength = strength || 2;
    this.bonusStrength = 0;
    this.modifierDuringOwnerTurn = 0;
  }
}
