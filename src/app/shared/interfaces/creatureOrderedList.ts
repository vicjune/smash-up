import { Player } from '@shared/models/player';

export interface CreatureOrderedList {
  players: {
    creatures: string[],
    player: Player;
  }[];
  monsters: string[];
}
