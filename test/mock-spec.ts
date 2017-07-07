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
    it('Sending in raw data to constructor allows manual setting of database state', () => {
      const m = new Mock({
        monkeys: {
          a: { name: 'abbey' },
          b: { name: 'bobby' },
          c: { name: 'cindy' }
        }
      });

      expect(m.db.monkeys).to.be.an('object');
      expect(m.db.monkeys.a.name).to.equal('abbey');
      expect(m.ref('/monkeys').onceSync('value').numChildren()).to.equal(3);
    });

    it('Adding a call to raw() allows additional state in conjunction with API additions', () => {
      const m = new Mock();
      m.addSchema('owner')
        .mock((h) => () => ({
          name: h.faker.name.firstName()
        }));
      m.queueSchema('owner', 10).generate();
      m.raw({
        monkeys: {
          a: { name: 'abbey' },
          b: { name: 'bobby' },
          c: { name: 'cindy' }
        }
      });

      expect(m.db.monkeys).to.be.an('object');
      expect(m.db.owners).to.be.an('object');
      expect(m.db.monkeys.a.name).to.equal('abbey');
      expect(m.ref('/monkeys').onceSync('value').numChildren()).to.equal(3);
      expect(m.ref('/owners').onceSync('value').numChildren()).to.equal(10);
    });

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

    it('Adding hasMany relationship does not add FK property without quantifyHasMany()', () => {
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


});
