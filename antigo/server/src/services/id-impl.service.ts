import { v4 as uuidv4 } from 'uuid';

import IdService from "./id.service";

export default class IdServiceImpl implements IdService {
  constructor() { }

  public create(): string {
    return uuidv4();
  }
}
