export const localStorage = {
  get <Type>(entity: string, mappingFunction?: (entity: Type) => Type): Type {
    let localEntities;
    try {
      localEntities = JSON.parse(window.localStorage.getItem(entity));
    } catch (e) {
      console.error(e);
    }

    localEntities = localEntities as Type;
    if (mappingFunction && localEntities) {
      return mappingFunction(localEntities);
    }
    return localEntities;
  },

  set(entity: string, payload: any): void {
    try {
      window.localStorage.setItem(entity, JSON.stringify(payload));
    } catch (e) {
      console.error(e);
    }
  },

  clear() {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.error(e);
    }
  }
};
