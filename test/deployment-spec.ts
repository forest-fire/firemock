import 'mocha';
import { IDictionary } from 'common-types';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
import Mock, { MockGeneratorCallback } from '../src/mock';
import SchemaHelper from '../src/schema-helper';
import { first, last } from 'lodash';

const expect = chai.expect;

describe('Deployment', () => {
  const animalMock: MockGeneratorCallback  = (h) => () => ({
    name: h.faker.name.firstName(),
    age: h.faker.helpers.randomize([1, 2, 4]),
    home: h.chance.address
  }); 

  it('Overriding the mock at deployment works', () => {
    const m = new Mock();
    m.addSchema('animal', animalMock);
    m.queueSchema('animal', 10);
    m.queueSchema('animal', 10, { age: 12 });
    m.generate();

    const results = m.ref('/animals').onceSync('value');
    const filtered = m.ref('/animals').equalTo(12, 'age').onceSync('value');
    
    expect(results.numChildren()).to.equal(20);
    expect(filtered.numChildren()).to.equal(10);
  });

});