import { boot } from './web/gameBoot';
import { setVersion } from './web/gameinfo';
window.onload = function () {
    (function () {
        /* eslint-disable */
        window.app2048 = {
            collision: new Function('return arguments[0]' + COLLISION_FUNCTION),
        };
        /* eslint-enable */
        boot();
        setVersion(document.querySelector('.version'));
    })();
};
