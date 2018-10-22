export const arrayUtils = {
  diff(longArray: any[], shortArray: any[]): any[] {
    return longArray.filter(i => shortArray.indexOf(i) < 0);
  },

  delete(id: string, array: any[]): any[] {
    const index = array.findIndex(element => element && element.id === id);
    if (index !== -1) {
      array.splice(index, 1);
    }
    return array;
  },

  getNewIndex(array: number[]) {
    for (let index = 1; index < 99; index++) {
      if (array.indexOf(index) === -1) {
        return index;
      }
    }
  }
};
