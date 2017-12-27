import { BaseModel } from './base-model';

export class Player extends BaseModel {
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
