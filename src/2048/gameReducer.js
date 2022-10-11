import { StateActions } from './stateActions';
export var gameReducer = function (state, action) {
    switch (action.type) {
        case StateActions.SET_SCORE:
            return Object.assign(state, { score: action.payload.score });
        case StateActions.ADD_SCORE:
            var currentScore = state.score + action.payload.score;
            if (currentScore > state.highScore) {
                state.highScore = currentScore;
            }
            return Object.assign(state, {
                score: currentScore,
            });
        case StateActions.SET_GAME_WON:
            return Object.assign(state, { won: true });
        case StateActions.UNSET_GAME_WON:
            return Object.assign(state, { won: false });
        case StateActions.SET_GAME_OVER:
            return Object.assign(state, { gameover: true });
        case StateActions.UNSET_GAME_OVER:
            return Object.assign(state, { gameover: false });
    }
};
