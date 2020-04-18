// import * as firebase from 'firebase-admin';
export default class Disconnected /** implements firebase.database.OnDisconnect */ {
    cancel(onComplete) {
        return Promise.resolve();
    }
    remove(onComplete) {
        return Promise.resolve();
    }
    set(value, onComplete) {
        return Promise.resolve();
    }
    setWithPriority(value, priority, onComplete) {
        return Promise.resolve();
    }
    update(values, onComplete) {
        return Promise.resolve();
    }
}
//# sourceMappingURL=Disconnected.js.map