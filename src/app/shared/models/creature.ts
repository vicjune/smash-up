import { Entity } from './entity';

export class Creature extends Entity {
  ownerId: string;
  strength: number;
  basicStrength: number;
  modifierDuringOwnerTurn: number;
  rotation: number;

  constructor(ownerId: string, strength?: number) {
    super();
    this.ownerId = ownerId;
    this.basicStrength = strength || 0;
    this.modifierDuringOwnerTurn = 0;
    this.rotation = Math.random();
  }
}
