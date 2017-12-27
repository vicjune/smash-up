import { BaseModel } from './base-model';

export class Player extends BaseModel {
  color: number;
  playing: boolean;
  name: string;
  score: number;

  constructor() {
    super();
    this.name = 'Test';
    this.score = Math.floor(Math.random() * 15) + 1;
  }
}
