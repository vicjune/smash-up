import { Entity } from './entity';

export class ConqueringScore extends Entity {
  playerId: string;
  score: number;
  timeout: any;

  constructor(playerId: string, score: number) {
    super();

    this.playerId = playerId;
    this.score = score;
  }
}
