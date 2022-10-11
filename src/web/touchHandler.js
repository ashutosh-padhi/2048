export var registerTouch = function (element, eventCallback, threshold) {
    var startPosition = null,
        endPosition = null;
    threshold = threshold || 0;
    if (!element) {
        throw {
            name: 'TypeError',
            message: 'expected a HTMLElement but recieved ' + element,
        };
    }
    if (!eventCallback || typeof eventCallback !== 'function') {
        throw {
            name: 'TypeError',
            message: 'expected a proper event callback function',
        };
    }
    element.addEventListener('touchstart', function (e) {
        if (e.touches.length < 2) {
            startPosition = [e.touches[0].clientX, e.touches[0].clientY];
        }
        e.preventDefault();
    });
    element.addEventListener('touchend', function (e) {
        var xdiff, ydiff;
        if (startPosition) {
            endPosition = [
                e.changedTouches[0].clientX,
                e.changedTouches[0].clientY,
            ];
            xdiff = endPosition[0] - startPosition[0];
            ydiff = endPosition[1] - startPosition[1];
            if (Math.abs(xdiff) >= threshold || Math.abs(ydiff) >= threshold) {
                if (Math.abs(xdiff) > Math.abs(ydiff)) {
                    if (xdiff > 0) {
                        eventCallback({ event: e, type: 'right' });
                    } else {
                        eventCallback({ event: e, type: 'left' });
                    }
                } else {
                    if (ydiff > 0) {
                        eventCallback({ event: e, type: 'down' });
                    } else {
                        eventCallback({ event: e, type: 'up' });
                    }
                }
            }
        }
        startPosition = null;
        endPosition = null;
        e.preventDefault();
    });
};
