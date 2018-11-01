import { Entity } from './entity';

export class Player extends Entity {
  color: number;
  playing: boolean;
  name: string;
  score: number;
  realScore: number;

  constructor(name: string, color: number) {
    super();
    this.name = name;
    this.color = color;
    this.realScore = 0;
    this.score = this.realScore;
  }
}
