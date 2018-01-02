import { Entity } from './entity';

export class Base extends Entity {
  color: number;
  resistance: number;
  maxResistance: number;
  scores: {playerId: string, score: number, scoreModifier: number}[];
  rewards: number[];

  constructor(color: number) {
    super();
    this.scores = [];
    this.color = color;
    this.maxResistance = 20;
    this.resistance = this.maxResistance;
    this.rewards = [0, 0, 0];
  }
}
