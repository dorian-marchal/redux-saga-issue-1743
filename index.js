import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import { put, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

// A simple reducer that counts PING and PONG actions.
const initialState = { pingCount: 0, pongCount: 0 };
function reducer(state = initialState, action) {
  switch (action.type) {
    case 'PING':
      return { ...state, pingCount: state.pingCount + 1 };
    case 'PONG':
      return { ...state, pongCount: state.pongCount + 1 };
  }
  return state;
}

// Dispatch a PONG action.
function* pong() {
  yield put({ type: 'PONG' });
}

// On every PING action, the `pong` saga is started.
function* rootSaga() {
  yield takeEvery('PING', pong);
}

// Create the store and the saga middleware.
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, undefined, applyMiddleware(sagaMiddleware));

// Start saga.
sagaMiddleware.run(rootSaga);

// Dispatch a PING. We expect a PONG from saga.
store.dispatch({ type: 'PING' });

// End and restart saga.
store.dispatch(END);
sagaMiddleware.run(rootSaga);

// Dispatch a PING. We expect an other PONG from the newly started saga.
store.dispatch({ type: 'PING' });

const expectedState = { pingCount: 2, pongCount: 2 };
const currentState = store.getState();

if (!_.isEqual(currentState, expectedState)) {
  console.log(`ERROR:
    Expected state: ${JSON.stringify(expectedState)},
    Current state:  ${JSON.stringify(currentState)}
  `);
} else {
  console.log('OK');
}
