import { ItemCoordinates } from '@shared/interfaces/itemCoordinates';

export const position = {
  pxToPercent(value: number, direction: 'x'|'y') {
    if (direction === 'x') {
      return value * 100 / window.innerWidth;
    } else if (direction === 'y') {
      return value * 100 / window.innerHeight;
    } else {
      return value;
    }
  },

  isSuperposing(itemACoordinates: ItemCoordinates, itemBCoordinates: ItemCoordinates, itemBList: ItemCoordinates[]) {
    return true;
  }
};
