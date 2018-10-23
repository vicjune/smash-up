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

  getSuperposingId(itemACoordinates: ItemCoordinates, itemBList: ItemCoordinates[], itemBBlackList: string[]): ItemCoordinates {
    let i = itemBList.length;
    while (i--) {
      if (this.isSuperposing(itemACoordinates, itemBList[i])) {
        return !itemBBlackList.find(blackListedId => blackListedId === itemBList[i].itemId) ? itemBList[i] : null;
      }
    }
    return null;
  },

  isSuperposing(itemACoordinates: ItemCoordinates, itemBCoordinates: ItemCoordinates): boolean {
    const itemAX = itemACoordinates.x + itemACoordinates.width / 2;
    const isSupperposingX = itemAX <= (itemBCoordinates.x + itemBCoordinates.width) && itemAX >= itemBCoordinates.x;

    const itemAY = itemACoordinates.y + itemACoordinates.height / 2;
    const isSupperposingY = itemAY <= (itemBCoordinates.y + itemBCoordinates.height) && itemAY >= itemBCoordinates.y;

    return isSupperposingX && isSupperposingY;
  }
};
