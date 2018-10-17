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
    const isSupperposingX =
    (itemACoordinates.x + this.pxToPercent(itemACoordinates.width, 'x') / 2) <= (itemBCoordinates.x + this.pxToPercent(itemBCoordinates.width, 'x')) &&
    (itemACoordinates.x + this.pxToPercent(itemACoordinates.width, 'x') / 2) >= itemBCoordinates.x;
    const isSupperposingY =
    (itemACoordinates.y + this.pxToPercent(itemACoordinates.height, 'y') / 2) <= (itemBCoordinates.y + this.pxToPercent(itemBCoordinates.height, 'y')) &&
    (itemACoordinates.y + this.pxToPercent(itemACoordinates.height, 'y') / 2) >= itemBCoordinates.y;
    return isSupperposingX && isSupperposingY;
  }
};
