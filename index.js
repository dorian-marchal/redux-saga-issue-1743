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

const aLittleTime = () => (Math.random() + 0.5) * 1000;

const sagaMiddleware = createSagaMiddleware();

const bindMiddleware = (middlewares = []) => applyMiddleware(...middlewares);

function* onLoadPage({ payload: { name } }) {
  yield delay(aLittleTime());
  yield put({ type: 'HEADER', payload: name });
  yield delay(aLittleTime());
  yield put({ type: 'BODY', payload: name });
  yield delay(aLittleTime());
  yield put({ type: 'FOOTER', payload: name });
}

function* rootSaga() {
  yield all([takeLatest('LOAD_PAGE', onLoadPage)]);
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

const loadPage = (name) => store.dispatch({ type: 'LOAD_PAGE', payload: { name } });

loadPage('home');
loadPage('news');
loadPage('contact');
loadPage('reviews');
loadPage('games');
