import 'mocha';
import { IDictionary } from 'common-types';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
import {db, clearDatabase} from '../src/database';

const expect = chai.expect;

describe('Database testing', () => {
  db.foo = 'bar';
  expect(Object.keys(db).length).to.equal(1);
  clearDatabase();
  expect(Object.keys(db).length).to.equal(0);
});