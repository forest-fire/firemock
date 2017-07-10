import { IDictionary } from 'common-types';
export let db: IDictionary = [];

export function clearDatabase() {
  db = {};
}

export function updateDatabase(state: any) {
  db = {
    ...db,
    ...state
  };
}