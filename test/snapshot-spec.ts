import 'mocha';
import { IDictionary } from 'common-types';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
import Mock, { SchemaCallback } from '../src/mock';
import SchemaHelper from '../src/schema-helper';
import { first, last } from 'lodash';
import SnapShot from '../src/snapshot';
import { firstProp, lastProp, firstKey, lastKey, Delays } from '../src/util';
const expect = chai.expect;

describe('SnapShot:', () => {
  it('a snapshot key property only returns last part of path', () => {
    const s = new SnapShot('people/-Keyre2234as', { name: 'foobar' });
    expect(s.key).to.equal('-Keyre2234as');
  });

});
