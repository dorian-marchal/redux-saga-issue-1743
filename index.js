import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import { all, takeLatest, put, delay, call } from 'redux-saga/effects';
import _ from 'lodash';

function reducer(state = {}, action) {
  console.log({ action });
  switch (action.type) {
    case 'HEADER':
      state = { ...state, header: action.payload };
      break;
    case 'BODY':
      state = { ...state, body: action.payload };
      break;
    case 'FOOTER':
      state = { ...state, footer: action.payload };
      break;
  }

  console.log({ state });
  console.log('');
  return state;
}

const sagaMiddleware = createSagaMiddleware();

const bindMiddleware = (middlewares = []) => applyMiddleware(...middlewares);

function* loadPage() {
  const id = _.uniqueId();
  yield delay(1000);
  yield put({ type: 'HEADER', payload: id });
  yield delay(1000);
  yield put({ type: 'BODY', payload: id });
  yield delay(1000);
  yield put({ type: 'FOOTER', payload: id });
}

function* rootSaga() {
  yield all([takeLatest('LOAD_PAGE', loadPage)]);
}

function configureStore(state = initialState) {
  const store = createStore(reducer, state, bindMiddleware([sagaMiddleware]));
  store.runSagaTask = () => {
    store.sagaTask = sagaMiddleware.run(rootSaga);
  };

  store.stopSagaTask = async () => {
    store.dispatch(END);
    return store.sagaTask.done;
  };

  store.runSagaTask();
  return store;
}

const store = configureStore({});

store.dispatch({ type: 'LOAD_PAGE' });
