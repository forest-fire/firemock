import { IDictionary } from 'common-types';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
import Mock, { SchemaCallback } from '../src/mock';
import SchemaHelper from '../src/schema-helper';
import { first, last, difference } from 'lodash';
import SnapShot from '../src/snapshot';
import { reset } from '../src/database';
import {
  firstProp,
  lastProp,
  firstKey,
  lastKey,
  orderedSnapToJS,
  Delays
} from '../src/util';
import * as convert from 'typed-conversions';
import 'mocha';

const expect = chai.expect;

describe('Reference functions', () => {
  const mocker: SchemaCallback = (h) => () => ({
    name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
    gender: h.faker.helpers.randomize(['male', 'female']),
    age: h.faker.random.number({min: 1, max: 10})
  });
  interface IMocker {
    name: string;
    gender: string;
    age: number;
  }

  describe('Basic DB Querying: ', () => {
    beforeEach(() => {
      reset();
    })

    it.skip('using onceSync(), querying returns a synchronous result', () => {
      reset();
      const m = new Mock();
      m.addSchema('cat', mocker);
      m.queueSchema('cat', 5)
      m.generate();
      try {
        const results = m.ref('/cats').onceSync('value') as SnapShot;
        expect(results.val).to.be.a('function');
        expect(results.child).to.be.a('function');
        expect(results.hasChild).to.be.a('function');

        expect(results.key).to.equal('cats');
        expect(firstProp(results.val()).name).to.be.a('string');
      } catch(e) {
        throw new Error(e);
      }

    });

    it.skip('with default 5ms delay, querying returns an asynchronous result', () => {
      const m = new Mock();
      m.addSchema<IMocker>('foo', mocker);
      m.queueSchema('foo', 5).generate();
      return m.ref('/foos').once('value')
        .then((results) => {
          expect(results.numChildren()).is.equal(5);
          expect(helpers.firstRecord(results.val()).name).to.be.a('string');
          expect(helpers.firstRecord(results.val()).age).to.be.a('number');
        });
    });

    it.skip('with numeric delay, querying returns an asynchronous result', async() => {
      const m = new Mock();
      m.addSchema('foo', mocker);
      m.addSchema('bar', mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      m.setDelay(100);
      const results = await m.ref('/foos').once('value');
      expect(results.numChildren()).is.equal(5);
      expect(helpers.firstRecord(results.val()).name).to.be.a('string');
      expect(helpers.firstRecord(results.val()).age).to.be.a('number');
    });

    it.skip('with named delay, querying returns an asynchronous result', () => {
      const m = new Mock();

      m.addSchema('foo', mocker);
      m.addSchema('bar', mocker);
      m.queueSchema('foo', 5);
      m.queueSchema('bar', 5);
      m.generate();

      m.setDelay(Delays.mobile);
      return m.ref('/foos').once('value')
        .then(results => {
          expect(results.numChildren()).is.equal(5);
          expect(helpers.firstRecord(results.val()).name).to.be.a('string');
          expect(helpers.firstRecord(results.val()).age).to.be.a('number');
        });
    });

    it.skip('with delay range, querying returns an asynchronous result', () => {
      const m = new Mock();
      m.addSchema('foo', mocker);
      m.addSchema('bar', mocker);
      m.queueSchema('foo', 5).queueSchema('bar', 5).generate();
      m.setDelay([50, 80]);
      return m.ref('/foos').once('value')
        .then((results: any) => {
          expect(results.numChildren()).is.equal(5);
          expect(helpers.firstRecord(results.val()).name).to.be.a('string');
          expect(helpers.firstRecord(results.val()).age).to.be.a('number');
        });
    });

    it('querying results can be iterated over with forEach()', () => {
      const m = new Mock();
      m.addSchema('user').mock((h) => () => ({
        name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
        gender: h.faker.helpers.randomize(['male', 'female'])
      }));
      m.deploy.queueSchema('user', 5).generate();
      m.setDelay([50, 80]);
      return m.ref('/users').once('value').then(snap => {
        snap.forEach(r => {
          expect(r.val()).to.be.an('object');
          expect(r.val().name).to.be.a('string');
        });
      });
    });

  });

  describe('Filtered querying', () => {
    beforeEach(() => {
      reset();
    })

    /**
     * Note: limitToFirst is cullening the key's which are biggest/newest which is
     * the end of the list (wrt to natural sort order).
     */
    it('query list with limitToFirst() set', async() => {
      const m = new Mock();
      m.addSchema('monkey').mock(mocker);
      m.queueSchema('monkey', 15).generate();
      const snap = await m.ref('/monkeys')
        .limitToFirst(10)
        .once('value');

      const filteredMonkeys = snap.val();
      const allMonkeys = await m.ref('/monkeys').once('value');
      const sortedMonkeys = convert.snapshotToOrderedHash(allMonkeys);
      expect(snap.numChildren()).to.equal(10);
      expect(Object.keys(m.db.monkeys).length).to.equal(15);
      expect(Object.keys(m.db.monkeys).indexOf(firstKey(filteredMonkeys))).to.not.equal(-1);
      expect(Object.keys(m.db.monkeys).indexOf(lastKey(filteredMonkeys))).to.not.equal(-1);
      expect(Object.keys(filteredMonkeys)).to.include(lastKey(m.db.monkeys));
      expect(Object.keys(filteredMonkeys).indexOf(firstKey(m.db.monkeys))).to.equal(-1);
      expect(Object.keys(filteredMonkeys).indexOf(lastKey(sortedMonkeys))).to.equal(-1);
    });

    /**
     * Note: limitToLast is cullening the key's which are smallest/oldest which is
     * the start of the list.
     */
    it('query list with limitToLast() set', () => {
      const m = new Mock();
      m.addSchema('monkey').mock(mocker);
      m.deploy.queueSchema('monkey', 15).generate();
      return m.ref('/monkeys')
        .limitToLast(10)
        .once('value')
        .then(snap => {
          const listOf = snap.val();
          expect(snap.numChildren()).to.equal(10);
          expect(Object.keys(m.db.monkeys).length).to.equal(15);
          expect(Object.keys(m.db.monkeys).indexOf(lastKey(listOf))).to.not.equal(-1);
          expect(Object.keys(m.db.monkeys).indexOf(firstKey(listOf))).to.not.equal(-1);
          expect(Object.keys(listOf).indexOf(lastKey(m.db.monkeys))).to.equal(-1);
        });
    });

    it('equalTo() and orderByChild() work', () => {
      const m = new Mock();
      const young = (h: SchemaHelper) => () => ({
        first: h.faker.name.firstName(),
        age: 12
      });
      const old = (h: SchemaHelper) => () => ({
        first: h.faker.name.firstName(),
        age: 75
      });
      m.addSchema('oldPerson', old)
        .modelName('person');
      m.addSchema('youngPerson', young)
        .modelName('person');
      m.deploy
        .queueSchema('oldPerson', 10)
        .queueSchema('youngPerson', 10)
        .generate();
      return m.ref('/people')
        .orderByChild('name')
        .equalTo(12, 'age')
        .once('value')
        .then(snap => {
          expect(Object.keys(m.db.people).length).to.equal(20);
          expect(snap.numChildren()).to.equal(10);
        });
    });

    it('startAt() filters a numeric property', async() => {
      const m = new Mock();
      m.addSchema('dog', (h) => () => ({
        name: h.faker.name.firstName,
        age: 3,
        desc: h.faker.random.words()
      }));
      m.queueSchema('dog', 10);
      m.queueSchema('dog', 10, { age: 5 });
      m.queueSchema('dog', 10, { age: 10 });
      m.generate();

      const results = await m.ref('/dogs').once('value');
      const gettingMature = await m.ref('/dogs').startAt(5, 'age').once('value');
      const mature = await m.ref('/dogs').startAt(9, 'age').once('value');

      expect(results.numChildren()).to.equal(30);
      expect(gettingMature.numChildren()).to.equal(20);
      expect(mature.numChildren()).to.equal(10);
    });

    it('startAt() filters a string property', () => {
      const m = new Mock();
      m.addSchema('dog', (h) => () => ({
        name: h.faker.name.firstName,
        born: "2014-09-08T08:02:17-05:00"
      }));
      m.queueSchema('dog', 10);
      m.queueSchema('dog', 10, { born: "2014-11-08T08:02:17-05:00" });
      m.queueSchema('dog', 10, { born: "2016-12-08T08:02:17-05:00" });
      m.generate();

      const all = m.ref('/dogs').onceSync('value');
      const nov14 = m.ref('/dogs').startAt("2014-11-01T01:00:00-05:00", 'born').onceSync('value');
      const pupsOnly = m.ref('/dogs').startAt("2016-12-01T08:02:17-05:00", 'born').onceSync('value');

      expect(all.numChildren()).to.equal(30);
      expect(nov14.numChildren()).to.equal(20);
      expect(pupsOnly.numChildren()).to.equal(10);
    });


    it.skip('startAt() filters sort by value when using value sort');
    it.skip('endAt() filters result by key by default');
    it('endAt() filters a numeric property', () => {
      const m = new Mock();
      m.addSchema('dog', (h) => () => ({
        name: h.faker.name.firstName,
        age: 1
      }));
      m.queueSchema('dog', 10);
      m.queueSchema('dog', 10, { age: 5 });
      m.queueSchema('dog', 10, { age: 10 });
      m.generate();

      const results = m.ref('/dogs').onceSync('value');
      const pups = m.ref('/dogs').endAt(2, 'age').onceSync('value');

      expect(results.numChildren()).to.equal(30);
      expect(pups.numChildren()).to.equal(10);
    });
    it.skip('endAt() filters sort by value when using value sort');
    it('startAt() combined with endAt() filters correctly', () => {
      const m = new Mock();
      m.addSchema('dog', (h) => () => ({
        name: h.faker.name.firstName,
        age: 1,
      }));
      m.queueSchema('dog', 10);
      m.queueSchema('dog', 10, { age: 5 });
      m.queueSchema('dog', 10, { age: 10 });
      m.generate();

      const results = m.ref('/dogs').onceSync('value');
      const middling = m.ref('/dogs')
        .startAt(3, 'age')
        .endAt(9, 'age')
        .onceSync('value');

      expect(results.numChildren()).to.equal(30);
      expect(middling.numChildren()).to.equal(10);
      expect(firstProp(middling.val()).age).to.equal(5);
      expect(lastProp(middling.val()).age).to.equal(5);

    });

    it.skip('startAt(), endAt(), orderByValue() filters correctly');

  }); // End Filtered Querying

  describe('Sort Order', () => {
    beforeEach(() => {
      reset();
    })

    const personMock = (h: SchemaHelper) => () => ({
      name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
      age: h.faker.random.number({min: 1, max: 80}),
      inUSA: h.chance.bool()
    });

    const numbers = [123, 456, 7878, 9999, 10491, 15000, 18345, 20000];
    const strings = ['abc', 'def', 'fgh', '123', '999', 'ABC', 'DEF'];

    it('orderByChild() -- where child is a string -- sorts correctly', async () => {
      const m = new Mock();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.generate();
      const results = m.ref('/people')
        .orderByChild('name')
        .onceSync('value');

      const orderedPeople = convert.snapshotToOrderedArray(results);
      for(let i = 1; i <= 8; i++) {
        expect(orderedPeople[i].name >= orderedPeople[i+1].name).is.equal(true);
      }

      const orderedKeys = orderedPeople.map(p => p.id);
      const unorderedKeys = convert.snapshotToArray(results).map(p => p.id);
      expect(JSON.stringify(orderedKeys)).to.not.equal(JSON.stringify(unorderedKeys));
      expect(difference(orderedKeys, unorderedKeys).length).to.equal(0);
    });

    it('orderByChild() -- where child is a boolean -- sorts correctly', async () => {
      const m = new Mock();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.generate();
      const results = m.ref('/people')
        .orderByChild('inUSA')
        .onceSync('value');

      const orderedPeople = convert.snapshotToOrderedArray(results);

      for(let i = 1; i <= 8; i++) {
        const current = orderedPeople[i].inUSA ? 1 : 0;
        const next = orderedPeople[i+1].inUSA ? 1 : 0;
        expect(current >= next).is.equal(true);
      }

      const orderedKeys = orderedPeople.map(p => p.id);
      const unorderedKeys = convert.snapshotToArray(results).map(p => p.id);
      expect(JSON.stringify(orderedKeys)).to.not.equal(JSON.stringify(unorderedKeys));
      expect(difference(orderedKeys, unorderedKeys).length).to.equal(0);
    });

    it('orderByKey() sorts correctly', async() => {
      const m = new Mock();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.generate();
      const people = await m.ref('/people').orderByKey().once('value');
      const defaultPeople = await m.ref('/people').once('value');
      expect(JSON.stringify(people)).to.equal(JSON.stringify(defaultPeople));
      const orderedPeople = convert.snapshotToOrderedArray(people);
      const orderedKeys = orderedPeople.map(p => p.id);
      const unorderedKeys = convert.snapshotToArray(people).map(p => p.id);
      expect(JSON.stringify(orderedKeys)).to.not.equal(JSON.stringify(unorderedKeys));
      expect(difference(orderedKeys, unorderedKeys).length).to.equal(0);
    });

    it('orderByValue() sorts correctly', async() => {
      const m = new Mock();
      m.addSchema('number', (h) => () => h.faker.random.number({min: 0, max: 1000}));
      m.queueSchema('number', 10);
      m.generate();

      const snap = await m.ref('/numbers').orderByValue().once('value');
      const orderedSnap = convert.snapshotToOrderedArray(snap);
      const orderedKeys = orderedSnap.map(p => p.id);
      const unorderedKeys = convert.snapshotToArray(snap).map(p => p.id);
      expect(JSON.stringify(orderedKeys)).to.not.equal(JSON.stringify(unorderedKeys));
      expect(difference(orderedKeys, unorderedKeys).length).to.equal(0);
      for(let i = 1; i <= 8; i++) {
        expect(orderedSnap[i] >= orderedSnap[i+1]).is.equal(true);
      }
    });

    it('orderByChild() combines with limitToFirst() for "server-side" selection', async() => {
      const m = new Mock();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.queueSchema('person', 10, { age: 99 });
      m.generate();
      const results = await m.ref('/people')
        .orderByChild('age')
        .limitToFirst(10)
        .once('value');
      const orderedPeople = convert.snapshotToOrderedArray(results);
      expect(orderedPeople).to.have.length(10);
      orderedPeople.map(person => {
        expect(person.age).to.equal(99);
      });
    });
    it('orderByChild() combines with limitToLast() for "server-side" selection', async() => {
      const m = new Mock();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.queueSchema('person', 10, { age: 1 });
      m.generate();
      const results = await m.ref('/people')
        .orderByChild('age')
        .limitToLast(10)
        .once('value');
      const orderedPeople = convert.snapshotToOrderedArray(results);
      expect(orderedPeople).to.have.length(10);
      orderedPeople.map(person => {
        expect(person.age).to.equal(1);
      });
    });
  });

  describe('CRUD actions', () => {
    beforeEach(() => {
      reset();
    })

    it('push() can push record', async() => {
      const m = new Mock();
      await m.ref('/people').push({
        name: 'Happy Jack',
        age: 26
      });
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.length(people)).to.equal(1);
      expect(helpers.firstRecord(people).name).to.equal('Happy Jack');
    });

    it('push() can push scalar', async() => {
      const m = new Mock();
      await m.ref('/data').push(444);
      const data = (await m.ref('/data').once('value')).val();
      expect(helpers.firstRecord(data)).to.equal(444);
    });

    it('push() will call callback after pushing to DB', async() => {
      const m = new Mock();
      let count = 0;
      const callback = () => count++;
      await m.ref('/data').push(444, callback);
      const data = (await m.ref('/data').once('value')).val();
      expect(helpers.firstRecord(data)).to.equal(444);
      expect(count).to.equal(1);
    });

    it('set() will set referenced path', async() => {
      const m = new Mock();
      await m.ref('/people/abcd').set({
        name: 'Happy Jack',
        age: 26
      });
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.length(people)).to.equal(1);
      expect(helpers.firstKey(people)).to.equal('abcd');
      expect(helpers.firstRecord(people).name).to.equal('Happy Jack');
    });

    it('set() will call callback after setting referenced path ', async () => {
      const m = new Mock();
      let count = 0;
      const callback = () => count++;
      await m.ref('/people/abcd').set({
        name: 'Happy Jack',
        age: 26
      }, callback);
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.firstRecord(people).name).to.equal('Happy Jack');
      expect(count).to.equal(1);
    });

    it('update() will update referenced path', async() => {
      const m = new Mock({
        people: {
          abcd: {
            name: 'Happy Jack',
            age: 35
          }
        }
      });
      await m.ref('/people/abcd').update({
        age: 26
      });
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.length(people)).to.equal(1);
      expect(helpers.firstKey(people)).to.equal('abcd');
      expect(helpers.firstRecord(people).name).to.equal('Happy Jack');
      expect(helpers.firstRecord(people).age).to.equal(26);
    });

    it('remove() will remove data at referenced path', async() => {
      const m = new Mock({
        people: {
          abcd: {
            name: 'Happy Jack',
            age: 35
          }
        }
      });
      await m.ref('/people/abcd').remove();
      const people = (await m.ref('/people').once('value')).val();
      expect(helpers.length(people)).to.equal(0);
    });
  });

});
