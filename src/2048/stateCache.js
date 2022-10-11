import { createPubSub } from '../pubsub';
import { deepCopy } from '../utils';

export var createCacheStore = function (size) {
    var store = [];
    var doOnSizeChange = createPubSub();
    var doOnStorePush = createPubSub();
    var push = function (state) {
        if (store.length < size) {
            store.push(state);
            doOnSizeChange.publish(getSize());
        } else {
            store.shift();
            store.push(state);
        }
        doOnStorePush.publish(deepCopy(store));
    };
    var getMaxSize = function () {
        return size;
    };
    var getSize = function () {
        return store.length;
    };
    var pop = function () {
        var state = store.pop();
        if (state) {
            doOnSizeChange.publish(getSize());
        }
        return state || null;
    };
    var restore = function (str) {
        store = str;
    };
    return {
        push: push,
        maxSize: getMaxSize,
        size: getSize,
        pop: pop,
        clean: function () {
            store = [];
            doOnSizeChange.publish(0);
        },
        restore: restore,
        doOnSizeChange: doOnSizeChange,
        doOnStorePush: doOnStorePush,
    };
};
