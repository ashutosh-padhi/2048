var deepCopy = function (src, dst) {
    if (typeof src !== 'object') {
        throw {
            type: 'TypeError',
            message: 'expecting source to be a object',
        };
    }
    if (dst && typeof src !== 'object') {
        throw {
            type: 'TypeError',
            message: 'expecting destination to be a object',
        };
    }
    if (!dst) {
        if (Object.prototype.toString.apply(src) === '[object Array]') {
            dst = [];
        } else {
            dst = {};
        }
    }
    for (var srcItem in src) {
        if (Object.prototype.hasOwnProperty.apply(src, [srcItem])) {
            if (typeof src[srcItem] !== 'object') {
                dst[srcItem] = src[srcItem];
            } else {
                dst[srcItem] = deepCopy(src[srcItem]);
            }
        }
    }
    return dst;
};
var bind = function (fn) {
    if (typeof fn !== 'function') {
        throw {
            name: 'TypeError',
            message: 'expecting a function as first argument',
        };
    }
    var args = Array.prototype.slice.apply(arguments, [1]);
    return function () {
        var args2 = Array.prototype.slice.apply(arguments);
        return fn.apply(null, args.concat(args2));
    };
};

export { bind, deepCopy };
