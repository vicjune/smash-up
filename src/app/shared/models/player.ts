import { BaseModel } from './base-model';

export class Player extends BaseModel {
  color: number;
  playing: boolean;
  name: string;
  score: number;

  constructor() {
    super();
    this.name = 'Jean';
    this.score = 0;
  }
}
