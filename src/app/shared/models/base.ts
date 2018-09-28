import { Entity } from './entity';

export class Base extends Entity {
  color: number;
  resistance: number;
  maxResistance: number;
  scores: Score[];
  rewards: number[];
  position: {
    x: number,
    y: number,
    rotation: number
  };
  creatures: string[];

  constructor() {
    super();
    this.scores = [];
    this.maxResistance = 20;
    this.rewards = [0, 0, 0];
    this.position = {
      x: Math.floor(Math.random() * (60 - 30 + 1)) + 30,
      y: Math.floor(Math.random() * (60 - 30 + 1)) + 30,
      rotation: Math.random()
    };
    this.creatures = [];
  }
}

export interface Score {
  playerId: string;
  score: number;
}
