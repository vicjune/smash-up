import { Entity } from './entity';

export class Base extends Entity {
  color: number;
  resistance: number;
  maxResistance: number;
  scores: {playerId: string, score: number, scoreModifier: number}[];
  rewards: number[];
  position: {
    x: number,
    y: number,
    rotation: number
  };

  constructor() {
    super();
    this.scores = [];
    this.maxResistance = 20;
    this.resistance = this.maxResistance;
    this.rewards = [0, 0, 0];
    this.position = {
      x: Math.random() * 50,
      y: Math.random() * 50,
      rotation: Math.random()
    };
  }
}
