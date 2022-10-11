export var createPipeline = function () {
    var pipeline = [];
    var selfdestruct = [];
    var add = function (fn, selfDestruct) {
        if (typeof fn !== 'function') {
            throw {
                name: 'TypeError',
                message: 'expecting a function',
            };
        }
        if (selfDestruct) {
            selfdestruct.push(fn);
        }
        pipeline.push(fn);
    };
    var remove = function (fn) {
        var fnIndex = pipeline.indexOf(fn);
        if (fnIndex === -1) return -1;
        return pipeline.splice(fnIndex, 1);
    };
    var removeFromSelfdestruct = function (fn) {
        var fnIndex = selfdestruct.indexOf(fn);
        if (fnIndex === -1) return -1;
        return selfdestruct.splice(fnIndex, 1);
    };
    var runReverse = function (seed) {
        return pipeline.reduce(function (a, b) {
            var returnValue = b.apply(null, [a]);
            if (selfdestruct.indexOf(b) !== -1) {
                remove(b);
                removeFromSelfdestruct(b);
            }
            return returnValue;
        }, seed);
    };
    var run = function (seed) {
        return pipeline.reduceRight(function (a, b) {
            var returnValue = b.apply(null, [a]);
            if (selfdestruct.indexOf(b) !== -1) {
                remove(b);
            }
            return returnValue;
        }, seed);
    };
    return {
        add: add,
        remove: remove,
        runReverse: runReverse,
        run: run,
    };
};
