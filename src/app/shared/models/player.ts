import { Entity } from './entity';

export class Player extends Entity {
  color: number;
  playing: boolean;
  name: string;
  score: number;

  constructor(name: string) {
    super();
    this.name = name;
    this.score = 0;
  }
}
