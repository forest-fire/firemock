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
describe('Reference functions', () => {
  const mocker = (h: SchemaHelper) => () => 'result';

  describe('Basic DB Querying', () => {

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

  });
  describe('Filtered querying', () => {

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

    it('equalTo() reduces query to only those equal to child property', done => {
      const m = new Mock();
      const young = (h: SchemaHelper) => () => ({
        first: h.faker.name.firstName,
        age: 12
      });
      const old = (h: SchemaHelper) => () => ({
        first: h.faker.name.firstName,
        age: 75
      });
      m.addSchema('oldPerson')
        .mock(old)
        .modelName('person');
      m.addSchema('youngPerson')
        .mock(young)
        .modelName('person');
      m
        .queueSchema('oldPerson', 10)
        .queueSchema('youngPerson', 10)
        .generate();
      m.ref('/people')
        .equalTo(12, 'age')
        .once('value')
        .then(snap => {
          const listOf = snap.val();
          expect(snap.numChildren()).to.equal(10);

          done();
        });
    });

    it.skip('startAt() filters sort by key by default');
    it.skip('startAt() filters sort by value when using value sort');
    it.skip('endAt() filters result by key by default');
    it.skip('endAt() filters sort by value when using value sort');
    it.skip('startAt() combined with endAt() filters correctly');
    it.skip('startAt(), endAt(), orderByValue() filters correctly');

  }); // End Filtered Querying

  describe('Sort Order', () => {

    it.skip('orderByChild() sorts correctly');
    it.skip('orderByKey() sorts correctly');
    it.skip('orderByValue() sorts correctly');

    it.skip('orderByChild() combines with limitToFirst() for "server-side" selection');
    it.skip('orderByChild() combines with limitToLast() for "server-side" selection');

  });

});