export const arrayUtils = {
  diff(longArray: any[], shortArray: any[]): any[] {
    return longArray.filter(i => shortArray.indexOf(i) < 0);
  },

  getNewIndex(array: number[]) {
    for (let index = 1; index < 99; index++) {
      if (array.indexOf(index) === -1) {
        return index;
      }
    }
  },

  arrayOfInts(length: number) {
    const array = [];
    for (let index = 1; index < length + 1; index++) {
      array[index] = index;
    }
    return array;
  }
};
