import { uuid } from '@shared/utils/uuid';

export class Entity {
  id: string;

  constructor() {
    this.id = uuid.generate();
  }
}
