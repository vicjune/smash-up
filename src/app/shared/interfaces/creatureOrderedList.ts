export interface CreatureOrderedList {
  players: {
    creatures: string[],
    playerColor: number;
  }[];
  monsters: string[];
}
