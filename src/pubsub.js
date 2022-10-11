export var createPubSub = function () {
    var actionList = [];
    return {
        publish: function () {
            var i;
            for (i = 0; i < actionList.length; i++) {
                if (typeof actionList[i] === 'function') {
                    actionList[i].apply(null, arguments);
                }
            }
        },
        subscribe: function (fn) {
            if (typeof fn === 'function') {
                actionList.push(fn);
            }
            return {
                unsubscribe: function () {
                    var fnIndex = actionList.indexOf(fn);
                    actionList.splice(fnIndex, 1);
                },
            };
        },
    };
};
