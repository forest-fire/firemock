import 'mocha';
import '../src/base-defs';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
import Mock, { Delays, SchemaHelper } from '../src/mock';
import { first, last } from 'lodash';
import SnapShot from '../src/snapshot';
import { 
  firstProp, 
  lastProp, 
  firstKey, 
  lastKey 
} from '../src/util';

const expect = chai.expect;

describe('Mock class()', () => {
  it('Mock → Schema API structured correctly', () => {
    const m = new Mock();
    const schemaApi = m.addSchema('foo');
    expect(schemaApi.mock).is.a('function');
    expect(schemaApi.belongsTo).is.a('function');
    expect(schemaApi.hasMany).is.a('function');
    expect(schemaApi.pluralName).is.a('function');
    // expect(schemaApi.databasePrefix).is.a('function');
  });

  it('Mock → Deployment API starts minimally', () => {
    const m = new Mock();
    const deployApi = m.build;

    expect(deployApi.queueSchema).is.a('function');
    expect(Object.keys(deployApi).length).is.equal(1);
  });

  it('Mock → Deployment API expands once a schema is queued', () => {
    const m = new Mock();
    m
      .addSchema('foo')
      .mock((h: SchemaHelper) => () => 'testing')
    const deployApi = m.queueSchema('foo');

    expect(deployApi.queueSchema).is.a('function');
    expect(deployApi.quantifyHasMany).is.a('function');
    expect(deployApi.fulfillBelongsTo).is.a('function');
    expect(deployApi.generate).is.a('function');
  });

  describe('Building and basic config of database', () => {
    it('Simple mock-to-generate populates DB correctly', () => {
      const m = new Mock();
      m
        .addSchema('foo')
        .mock((h: SchemaHelper) => () => {
          return {
            first: h.faker.name.firstName(),
            last: h.faker.name.lastName()
          };
        });
      m
        .queueSchema('foo', 5)
        .generate();

      const listOfFoos = m.db.foos;
      const keys = Object.keys(listOfFoos);
      const firstFoo = listOfFoos[first(keys)];

      expect(listOfFoos).is.an('object');
      expect(firstFoo.first).is.a('string');
      expect(firstFoo.last).is.a('string');
      expect(keys.length).is.equal(5);
    });

    it("using pluralName() modifier changes a schema's database path", () => {
      const m = new Mock();
      m
        .addSchema('foo')
          .mock((h: SchemaHelper) => () => 'result')
          .pluralName('fooie')
        .addSchema('company') // built-in exception
          .mock((h: SchemaHelper) => () => 'ignored')
        .addSchema('fungus') // rule trigger
          .mock((h: SchemaHelper) => () => 'ignored')
        .build
          .queueSchema('foo')
          .queueSchema('company')
          .queueSchema('fungus')
          .generate();

      expect(m.db.foos).is.equal(undefined);
      expect(m.db.fooie).is.an('object');
      expect(firstProp(m.db.fooie)).is.equal('result');
      expect(m.db.companies).is.an('object');
      expect(m.db.fungi).is.an('object');
    });

    it('using modelName() modifier changes db path appropriately', () => {
      const m = new Mock();
      m
        .addSchema('foo')
        .mock((h: SchemaHelper) => () => 'result')
        .modelName('car');
      m
        .queueSchema('foo')
        .generate();

      expect(m.db.foos).is.equal(undefined);
      expect(m.db.cars).is.an('object');
      expect(firstProp(m.db.cars)).is.equal('result');
    });
  });

  describe('Relationships', () => {
    it('Adding belongsTo relationship adds FK property with empty value',
      () => {
        const m = new Mock();
        m
          .addSchema('user')
          .mock((h: SchemaHelper) => () => {
            return { name: h.faker.name.firstName() };
          })
          .belongsTo('company');
        m.build
          .queueSchema('user')
          .generate();
        
        expect(firstProp(m.db.users)).has.property('companyId');
        expect(firstProp(m.db.users).companyId).is.equal('');
      }
    );
    it('Adding belongsTo relationship adds fulfilled shadow FK property when external schema not present', () => {
      const m = new Mock();
      m
        .addSchema('user')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      m.build
        .queueSchema('user', 2).fulfillBelongsTo('company')
        .generate();

      expect(firstProp(m.db.users)).has.property('companyId');
      expect(lastProp(m.db.users)).has.property('companyId');
      expect(firstProp(m.db.users).companyId).is.a('string');
      expect(firstProp(m.db.users).companyId.slice(0, 1)).is.equal('-');
      expect(firstProp(m.db.users).companyId)
        .is.not.equal(lastProp(m.db.users).companyId);
    });

    it('Adding belongsTo relationship adds fulfilled real FK property when external schema is present but not deployed', () => {
      const m = new Mock();
      m.addSchema('user')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      m.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { companyName: h.faker.company.companyName() };
        });
      m.build
        .queueSchema('user', 2)
          .fulfillBelongsTo('company')
        .generate();
      
      expect(firstProp(m.db.users)).has.property('companyId');
      expect(firstProp(m.db.users).companyId).is.a('string');
      expect(firstProp(m.db.users).companyId.slice(0, 1)).is.equal('-');
      const companyFK = firstProp(m.db.users).companyId;
      const companyIds = Object.keys(m.db.companies);
      expect(companyIds.indexOf(companyFK))
        .is.not.equal(-1);
    });

    it('Adding belongsTo relationship adds fulfilled real FK property when available in DB', () => {
      const m = new Mock();
      m.addSchema('user')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      m.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { companyName: h.faker.company.companyName() };
        });
      m.build
        .queueSchema('user', 2)
          .fulfillBelongsTo('company')
        .queueSchema('company', 10)
        .generate();
      
      const firstCompanyId = firstProp(m.db.users).companyId;
      const companyIds = Object.keys(m.db.companies);
      expect(firstProp(m.db.users)).has.property('companyId');
      expect(firstCompanyId).is.a('string');
      expect(firstCompanyId.slice(0, 1)).is.equal('-');
      expect(companyIds.indexOf(firstCompanyId)).is.not.equal(-1);
    });

    it(
      'Adding hasMany relationship does not add FK property without quantifyHasMany()', () => {
        const m = new Mock();
        m
          .addSchema('company')
          .mock((h: SchemaHelper) => () => {
            return { name: h.faker.company.companyName() };
          })
          .hasMany('employee');
        m.queueSchema('company').generate();
        
        expect(firstProp(m.db.companies).employees).is.equal(undefined);
      }
    );

    it(
      'Adding hasMany with quantifyHasMany() produces ghost references when FK reference is not a defined schema', () => {
        const m = new Mock();
        m.addSchema('company')
          .mock((h: SchemaHelper) => () => {
            return { name: h.faker.company.companyName() };
          })
          .hasMany('employee');
        m.queueSchema('company')
          .quantifyHasMany('employee', 10);
        m.generate();
        
        expect(firstProp(m.db.companies).employees).is.an('object');
        expect(Object.keys(firstProp(m.db.companies).employees).length).is.equal(10);
        expect(m.db.employees).to.not.be.an('object');
      }
    );
    it(
      'Adding hasMany with quantifyHasMany() produces real references when FK reference is a defined schema',
    () => {
      const m = new Mock();
      m.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      m.addSchema('employee')
        .mock((h: SchemaHelper) => () => {
          return { 
            first: h.faker.name.firstName(),
            last: h.faker.name.lastName(),
          };
        });
      m.queueSchema('company')
        .quantifyHasMany('employee', 10);
      m.generate();
      
      expect(firstProp(m.db.companies).employees).is.an('object');
      expect(Object.keys(firstProp(m.db.companies).employees).length).is.equal(10);
      expect(m.db.employees).to.not.equal(undefined);
    });

    it('Adding hasMany with quantifyHasMany() leverages existing FK schemas when they already exist', () => {
      const m = new Mock();
      m.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      m.addSchema('employee')
        .mock((h: SchemaHelper) => () => {
          return { 
            first: h.faker.name.firstName(),
            last: h.faker.name.lastName(),
          };
        });
      m
        .queueSchema('employee', 25)
        .queueSchema('company')
          .quantifyHasMany('employee', 10);
      m.generate();
      
      expect(firstProp(m.db.companies).employees).is.an('object');
      expect(Object.keys(firstProp(m.db.companies).employees).length).is.equal(10);
      expect(m.db.employees).to.not.equal(undefined);
      expect(Object.keys(m.db.employees).length).to.equal(25);
    });

    it('Adding hasMany with quantifyHasMany() leverages existing FK schemas when they already exist, adds more when runs out', () => {
      const m = new Mock();
      m.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      m.addSchema('employee')
        .mock((h: SchemaHelper) => () => {
          return { 
            first: h.faker.name.firstName(),
            last: h.faker.name.lastName(),
          };
        });
      m
        .queueSchema('employee', 5)
        .queueSchema('company')
          .quantifyHasMany('employee', 10);
      m.generate();
      
      expect(firstProp(m.db.companies).employees).is.an('object');
      expect(Object.keys(firstProp(m.db.companies).employees).length).is.equal(10);
      expect(m.db.employees).to.not.equal(undefined);
      expect(Object.keys(m.db.employees).length).to.equal(10);
    });

  });

  describe('Basic DB Querying', () => {
    const mocker = (h: SchemaHelper) => () => 'result';

    it('using onceSync(), querying returns a synchronous result', () => {
      const m = new Mock();
      m.addSchema('foo').mock(mocker);
      m.addSchema('bar').mock(mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      const results = m.ref('/foos').onceSync('value') as SnapShot;
      expect(results.val).to.be.a('function');
      expect(results.child).to.be.a('function');
      expect(results.hasChild).to.be.a('function');

      expect(results.key).to.equal('foos');
      expect(firstProp(results.val())).to.equal('result');
    });

    it('with default 5ms delay, querying returns an asynchronous result', done => {
      const m = new Mock();
      m.addSchema('foo').mock(mocker);
      m.addSchema('bar').mock(mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      m.ref('/foos').once('value').then((results) => {
        expect(results.numChildren()).is.equal(5);
        expect(firstProp<string>(results.val())).to.equal('result');
        done();
      });
    });

    it('with numeric delay, querying returns an asynchronous result', done => {
      const m = new Mock();
      m.addSchema('foo').mock(mocker);
      m.addSchema('bar').mock(mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      m.setDelay(100);
      m.ref('/foos').once('value').then((results: any) => {
        expect(results.numChildren()).is.equal(5);
        expect(firstProp(results.val())).is.equal('result');
        done();
      });
    });

    it('with named delay, querying returns an asynchronous result', done => {
      const m = new Mock();
      m.addSchema('foo').mock(mocker);
      m.addSchema('bar').mock(mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      m.setDelay(Delays.mobile);
      m.ref('/foos').once('value').then(results => {
        expect(results.numChildren()).is.equal(5);
        expect(firstProp<string>(results.val())).is.equal('result');
        done();
      });
    });

    it('with delay range, querying returns an asynchronous result', done => {
      const m = new Mock();
      m.addSchema('foo').mock(mocker);
      m.addSchema('bar').mock(mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      m.setDelay([50, 80]);
      m.ref('/foos').once('value').then((results: any) => {
        expect(results.numChildren()).is.equal(5);
        expect(firstProp(results.val())).is.equal('result');
        done();
      });
    });

    it('querying results can be iterated over with forEach()', done => {
      const m = new Mock();
      m.addSchema('foo').mock(mocker);
      m.addSchema('bar').mock(mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      m.setDelay([50, 80]);
      m.ref('/foos').once('value').then(snap => {
        snap.forEach(r => {
          expect(r.val()).to.equal('result');
        });
        done();
      });
    });

    it('query list with limitToFirst() set', done => {
      const m = new Mock();
      m.addSchema('monkey').mock(mocker);
      m.queueSchema('monkey', 15).generate();
      m.ref('/monkeys')
        .limitToFirst(10)
        .once('value')
        .then(snap => {
          const listOf = snap.val();
          expect(snap.numChildren()).to.equal(10);
          expect(Object.keys(m.db.monkeys).length).to.equal(15);
          expect(Object.keys(m.db.monkeys).indexOf(firstKey(listOf))).to.not.equal(-1);
          expect(Object.keys(m.db.monkeys).indexOf(lastKey(listOf))).to.not.equal(-1);
          expect(Object.keys(listOf).indexOf(lastKey(m.db.monkeys))).to.equal(-1);

          done();
        });
    });

    it('query list with limitToLast() set', done => {
      const m = new Mock();
      m.addSchema('monkey').mock(mocker);
      m.queueSchema('monkey', 15).generate();
      m.ref('/monkeys')
        .limitToLast(10)
        .once('value')
        .then(snap => {
          const listOf = snap.val();
          expect(snap.numChildren()).to.equal(10);
          expect(Object.keys(m.db.monkeys).length).to.equal(15);
          expect(Object.keys(m.db.monkeys).indexOf(lastKey(listOf))).to.not.equal(-1);
          expect(Object.keys(m.db.monkeys).indexOf(firstKey(listOf))).to.not.equal(-1);
          expect(Object.keys(listOf).indexOf(firstKey(m.db.monkeys))).to.equal(-1);

          done();
        });
    });

  }); // End Querying Describe

});
