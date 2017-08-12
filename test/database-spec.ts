import { IDictionary, FirebaseEvent } from 'common-types';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
import Mock, { SchemaHelper, SchemaCallback } from '../src/mock';
import {
  db,
  clearDatabase,
  addListener,
  listenerCount,
  removeListener,
  removeAllListeners,
  listenerPaths,
  pushDB,
  setDB,
  removeDB,
  updateDB,
  findChildListeners,
  findValueListeners
} from '../src/database';
import { GenericEventHandler, HandleValueEvent } from '../src/query';
import 'mocha';

const expect = chai.expect;

interface IPerson {
  name: string;
  age: number;
}
const personMock: SchemaCallback<IPerson> = (h) => () => ({
  name: h.faker.name.firstName(),
  age: h.faker.random.number({min: 1, max: 70}),
  foo: 'bar',
  baz: 'baz'
})

describe('Database', () => {
  describe('Basics', () => {
    it('can clear database', () => {
      db.foo = 'bar';
      expect(Object.keys(db).length).to.equal(1);
      clearDatabase();
      expect(Object.keys(db).length).to.equal(0);
    });
  });

  describe('Listeners', () => {
    it('can add listeners', () => {
      const callback: GenericEventHandler = (snap) => null;
      addListener('/path/to/node', 'value', callback);
      expect(listenerCount()).to.equal(1);
      addListener('/path/to/node', 'value', callback);
      expect(listenerCount()).to.equal(2);
    });

    it('can remove all listeners', () => {
      const callback: GenericEventHandler = (snap) => undefined;
      removeAllListeners();
      addListener('/path/to/node', 'value', callback);
      addListener('/path/to/node', 'value', callback);
      addListener('/path/to/node', 'value', callback);
      expect(listenerCount()).to.equal(3);
      removeListener();
      expect(listenerCount()).to.equal(0);
      addListener('/path/to/node', 'value', callback);
      addListener('/path/to/node', 'value', callback);
      addListener('/path/to/node', 'value', callback);
      expect(listenerCount()).to.equal(3);
      removeAllListeners();
    });

    it('can remove all listeners of given eventType', () => {
      const callback: GenericEventHandler = (snap) => undefined;
      removeAllListeners();
      addListener('/path/to/value1', 'value', callback);
      addListener('/path/to/added', 'child_added', callback);
      addListener('/path/to/value2', 'value', callback);
      addListener('/path/to/moved', 'child_moved', callback);
      removeListener('child_added');
      expect(listenerCount()).to.equal(3);
      listenerPaths().forEach(p => expect(p).to.not.include('added'));
      removeListener('value');
      expect(listenerCount()).to.equal(1);
      listenerPaths().forEach(p => expect(p).to.include('moved'));
    });

    it('can remove listeners of same eventType, callback', () => {
      const callback: GenericEventHandler = (snap) => undefined;
      const callback2: GenericEventHandler = (snap) => undefined;
      removeAllListeners();
      addListener('/path/to/value1', 'value', callback);
      addListener('/path/to/value2', 'value', callback);
      addListener('/path/to/added', 'child_added', callback);
      addListener('/path/to/value3', 'value', callback2);
      addListener('/path/to/moved', 'child_moved', callback);
      removeListener('value', callback);
      expect(listenerCount()).to.equal(3);
      expect(listenerCount('value')).to.equal(1);
      listenerPaths('value').forEach(l => expect(l).to.include('value3'));
    });

    it(
      'can remove listeners of same eventType, callback, and context',
      () => {
        const callback: GenericEventHandler = (snap) => undefined;
        const callback2: GenericEventHandler = (snap) => undefined;
        const context = { foo: 'bar' };
        const context2 = { foo: 'baz' };
        removeAllListeners();
        addListener('/path/to/value1', 'value', callback, null, context);
        addListener('/path/to/value2', 'value', callback2, null, context);
        addListener('/path/to/added', 'child_added', callback, null, context);
        addListener('/path/to/value3', 'value', callback2, null, context2);
        addListener('/path/to/moved', 'child_moved', callback, null, context);
        expect(listenerCount()).to.equal(5);
        removeListener('value', callback2, context2);
        expect(listenerCount()).to.equal(4);
        expect(listenerPaths('value')).to.be.length(2);
      }
    );

    it('cancel callbacks are called when set', () => {
      let count = 0;
      const callback: GenericEventHandler = (snap) => undefined;
      const callback2: GenericEventHandler = (snap) => undefined;
      const cancelCallback = () => count++;
      removeAllListeners();
      addListener('/path/to/value1', 'value', callback, cancelCallback);
      addListener('/path/to/value2', 'value', callback2, cancelCallback);
      addListener('/path/to/added', 'child_added', callback, cancelCallback);
      addListener('/path/to/value3', 'value', callback2);
      addListener('/path/to/moved', 'child_moved', callback);
      let howMany = removeAllListeners();
      expect(howMany).to.equal(3);
      expect(count).to.equal(3);
      addListener('/path/to/value1', 'value', callback, cancelCallback);
      addListener('/path/to/value2', 'value', callback2, cancelCallback);
      addListener('/path/to/added', 'child_added', callback, cancelCallback);
      addListener('/path/to/value3', 'value', callback2);
      addListener('/path/to/moved', 'child_moved', callback);
      howMany = removeListener('value');
      expect(howMany).to.equal(2);
      expect(count).to.equal(5);
    });
  });

  describe('Writing to DB', () => {
    it('pushDB() works', () => {
      clearDatabase();
      const pushKey = pushDB('/people', {
        name: 'Humpty Dumpty',
        age: 5
      });
      // check directly in DB
      expect(pushKey).to.be.a('string');
      expect(pushKey).to.include('-');
      expect(db.people[pushKey]).to.be.an('object');
      expect(db.people[pushKey].name).to.equal('Humpty Dumpty');
    });

    it('setDB() works', () => {
      clearDatabase();
      setDB('/people/abc', {
        name: 'Humpty Dumpty',
        age: 5
      });
      expect(db.people.abc).to.be.an('object');
      expect(db.people.abc.name).to.equal('Humpty Dumpty');
    });

    it('updateDB() works', () => {
      clearDatabase();
      updateDB('/people/update', {
        name: 'Humpty Dumpty',
        age: 5
      });
      expect(db.people.update).to.be.an('object');
      expect(db.people.update.name).to.equal('Humpty Dumpty');
      expect(db.people.update.age).to.equal(5);
      updateDB('/people/update', {
        age: 6,
        nickname: 'Humpty'
      });
      expect(db.people.update.name).to.equal('Humpty Dumpty');
      expect(db.people.update.age).to.equal(6);
      expect(db.people.update.nickname).to.equal('Humpty');
    });

    it('removeDB() works', () => {
      clearDatabase();
      setDB('/people/remove', {
        name: 'Humpty Dumpty',
        age: 5
      });
      expect(db.people.remove.name).to.equal('Humpty Dumpty');
      expect(db.people.remove.age).to.equal(5);
      removeDB('/people/remove');

      expect(db.people.remove).to.equal(undefined);
    });
  })

  describe('Find Listeners', () => {
    it('find all child listeners at a path', () => {
      const callback: HandleValueEvent = (snap) => undefined;
      removeAllListeners();
      addListener('/auth/people', 'child_removed', callback);
      addListener('/auth/people', 'child_added', callback);
      addListener('/auth/people', 'child_moved', callback);
      addListener('/people', 'child_removed', callback);
      addListener('/auth/people', 'value', callback);
      addListener('/auth/company', 'child_removed', callback);
      const listeners = findChildListeners('/auth/people');
      expect(listeners).length(3);
    });

    it('find all child listeners at a path and event type', () => {
      const callback: HandleValueEvent = (snap) => undefined;
      removeAllListeners();
      addListener('/auth/people', 'child_removed', callback);
      addListener('/auth/people', 'child_added', callback);
      addListener('/auth/people', 'child_moved', callback);
      addListener('/people', 'child_removed', callback);
      addListener('/auth/people', 'value', callback);
      addListener('/auth/company', 'child_removed', callback);
      const listeners = findChildListeners('/auth/people', 'child_added');
      expect(listeners).length(1);
    });

    it('find all value listeners at a path', () => {
      const callback: HandleValueEvent = (snap) => undefined;
      removeAllListeners();
      addListener('/auth/people', 'child_removed', callback);
      addListener('/auth/people', 'child_added', callback);
      addListener('/auth/people', 'child_moved', callback);
      addListener('/people', 'child_removed', callback);
      addListener('/auth/people', 'value', callback);
      addListener('/auth', 'value', callback);
      addListener('/auth/company', 'child_removed', callback);
      const listenAtpeople = findValueListeners('/auth/people');
      expect(listenAtpeople).length(2);
      const listenAtAuth = findValueListeners('/auth');
      expect(listenAtAuth).length(1);
    });
  });

  describe('Handle Events', () => {
    it('listening to "value" responds to new child', (done) => {
      removeAllListeners();
      const callback: HandleValueEvent = (snap) => {
        const record = helpers.firstRecord(snap.val());
        console.log(record);

        expect(record.name).to.equal('Humpty Dumpty');
        expect(record.age).to.equal(5);
        done();
      };
      addListener('/people', 'value', callback);
      expect(listenerCount()).to.equal(1);
      const pushKey = pushDB('/people', {
        name: 'Humpty Dumpty',
        age: 5
      });
    });

    it('listening to "value" responds to deeply nested change', (done) => {
      removeAllListeners();
      const callback: HandleValueEvent = (snap) => {
        const record = snap.val();
        expect(record.a.b.c.d.name).to.equal('Humpty Dumpty');
        expect(record.a.b.c.d.age).to.equal(5);
        done();
      };
      addListener('/people', 'value', callback);
      expect(listenerCount()).to.equal(1);
      setDB('/people/a/b/c/d', {
        name: 'Humpty Dumpty',
        age: 5
      });
    });

    it('listening to "value" responds to removed child', async(done) => {
      removeAllListeners();
      let firstKey;
      const callback: HandleValueEvent = (snap) => {
        const list = snap.val();
        expect(snap.numChildren()).to.equal(9);
        done();
      };
      const m = new Mock();
      m.addSchema('person', personMock);
      m.queueSchema('person', 10);
      m.generate();
      addListener('/people', 'child_removed', callback);
      expect(listenerCount()).to.equal(1);
      const people = await m.ref('/people').once('value');
      firstKey = helpers.firstKey(people.val());
      removeDB(firstKey);
    });
    it.skip('listening to "value" responds to updated child');
    it.skip('listening to "value" responds to created leaf node');
    it.skip('listening to "value" responds to removed leaf node');
    it.skip('"child_added" responds to new child');
    it.skip('"child_added" ignores changed child');
    it.skip('"child_added" ignores removed child');
    it.skip('');
  });
});
