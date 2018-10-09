import { Entity } from './entity';

export class Player extends Entity {
  color: number;
  playing: boolean;
  name: string;
  score: number;
  realScore: number;

  constructor(name: string) {
    super();
    this.name = name;
    this.realScore = 0;
    this.score = this.realScore;
  }
}
