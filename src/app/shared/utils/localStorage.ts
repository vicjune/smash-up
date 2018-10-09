export const localStorage = {
  get: function <Type>(entity: string, mappingFunction?: (entity: Type) => Type): Type {
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

  set: function(entity: string, payload: any): void {
    try {
      window.localStorage.setItem(entity, JSON.stringify(payload));
    } catch (e) {
      console.error(e);
    }
  },

  clear: function() {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.error(e);
    }
  }
};
