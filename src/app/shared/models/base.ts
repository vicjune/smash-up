import { Entity } from './entity';

export class Base extends Entity {
  color: number;
  resistance: number;
  scores: {playerId: string, score: number, scoreModifier: number}[];
  rewards: number[];

  constructor(color: number, resistance: number, rewards: number[]) {
    super();
    this.scores = [];
    this.color = color;
    this.resistance = resistance;
    this.rewards = rewards;
  }
}
