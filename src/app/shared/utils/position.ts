import { ItemCoordinates } from '@shared/interfaces/itemCoordinates';

export const position = {
  pxToPercent(value: number, direction: 'x'|'y'): number {
    if (direction === 'x') {
      return value * 100 / window.innerWidth;
    } else if (direction === 'y') {
      return value * 100 / window.innerHeight;
    } else {
      return value;
    }
  },

  isSuperposingNoDuplicate(itemACoordinates: ItemCoordinates, itemBId: string, itemBList: ItemCoordinates[]) {
    const lastIdSupperposing = itemBList.reduce((previous, coordinates) => {
      return this.isSuperposing(itemACoordinates, coordinates) ? coordinates.itemId : previous;
    }, null);
    return lastIdSupperposing === itemBId;
  },

  isSuperposing(itemACoordinates: ItemCoordinates, itemBCoordinates: ItemCoordinates): boolean {
    const isSupperposingX =
    (itemACoordinates.x + this.pxToPercent(itemACoordinates.width, 'x') / 2) <= (itemBCoordinates.x + this.pxToPercent(itemBCoordinates.width, 'x')) &&
    (itemACoordinates.x + this.pxToPercent(itemACoordinates.width, 'x') / 2) >= itemBCoordinates.x;
    const isSupperposingY =
    (itemACoordinates.y + this.pxToPercent(itemACoordinates.height, 'y') / 2) <= (itemBCoordinates.y + this.pxToPercent(itemBCoordinates.height, 'y')) &&
    (itemACoordinates.y + this.pxToPercent(itemACoordinates.height, 'y') / 2) >= itemBCoordinates.y;
    return isSupperposingX && isSupperposingY;
  }
};
