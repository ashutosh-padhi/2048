import { createPubSub } from '../pubsub';
import { deepCopy } from '../utils';

export var createStateStore = function (state, reducer) {
    if (!reducer) {
        throw {
            name: 'TypeError',
            message: 'reducer is not passed to the store',
        };
    }
    if (typeof reducer !== 'function') {
        throw {
            name: 'TypeError',
            message: 'reducer should be a function',
        };
    }
    state = state || {};
    var doOnStateChange = createPubSub();
    var getState = function () {
        return deepCopy(state);
    };
    var getFromPath = function (path) {
        if (Object.prototype.toString.apply(path) !== '[object Array]') {
            throw {
                name: 'TypeError',
                message: 'expecting an array',
            };
        }
        var subStore;
        try {
            subStore = path.reduce(function (a, b) {
                return a[b];
            }, state);
        } catch (e) {
            throw {
                name: 'PathError',
                message: "property doesn't exist on the store",
            };
        }
        return typeof subStore === 'object' ? deepCopy(subStore) : subStore;
    };
    var dispatch = function (action) {
        state = reducer(state, action);
        doOnStateChange.publish(action, {
            getState: getState,
            getFromPath: getFromPath,
        });
    };
    var restore = function (newState) {
        if (newState && typeof newState === 'object') {
            state = Object.assign(state, newState);
            doOnStateChange.publish(
                { restore: true },
                {
                    getState: getState,
                    getFromPath: getFromPath,
                }
            );
        }
    };
    return {
        dispatch: dispatch,
        doOnStateChange: doOnStateChange,
        getFromPath: getFromPath,
        getState: getState,
        restore: restore,
    };
};
