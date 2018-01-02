import { Entity } from './entity';

export class Base extends Entity {
  color: number;
  resistance: number;
  maxResistance: number;
  scores: {playerId: string, score: number, scoreModifier: number}[];
  rewards: number[];

  constructor(resistance: number, rewards: number[], color: number) {
    super();
    this.scores = [];
    this.color = color;
    this.maxResistance = resistance;
    this.resistance = this.maxResistance;
    this.rewards = rewards;
  }
}
