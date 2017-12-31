import { Entity } from './entity';

export class Player extends Entity {
  color: number;
  playing: boolean;
  name: string;
  score: number;
  scoreModifier: number;
  scoreModifierDisplay: boolean;

  constructor(name: string) {
    super();
    this.name = name;
    this.score = 0;
    this.scoreModifier = 0;
    this.scoreModifierDisplay = false;
  }
}
