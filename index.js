import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import { all, takeEvery, put, call, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import _ from 'lodash';

console.log('---');

function reducer(state = {}, action) {
  console.log({ action });
  switch (action.type) {
    case 'LOAD_PAGE':
      state = { ...state, loadingPage: action.payload.name };
      break;
    case 'PAGE_LOADED':
      state = { ...state, loadingPage: null, loadedPage: state.loadingPage };
      break;
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

const aLittleTime = () => (Math.random() + 0.3) * 1000;

const sagaMiddleware = createSagaMiddleware();

const bindMiddleware = (middlewares = []) => applyMiddleware(...middlewares);

function* onLoadPage({ payload: { name } }) {
  yield call(delay, aLittleTime());
  // Ensure the page is the same.
  const loadingPage = yield select((state) => state.loadingPage);
  // Better find a way to cancel this saga to avoid uneeded fetch.
  // maybe use `takeLatest` with an other way to know if the page is loaded in getInitialProps.
  // Awaiting a listener on store could work.
  // Could we dispatch a callback that would be called by saga when the page is loaded?
  if (loadingPage === name) {
    yield put({ type: 'HEADER', payload: name });
    yield put({ type: 'BODY', payload: name });
    yield put({ type: 'FOOTER', payload: name });
    yield put({ type: 'PAGE_LOADED' });
  } else {
    yield put({ type: 'PAGE_CANCELED', payload: name });
  }
}

function* rootSaga() {
  // takeLatest can't be used, here, as saga is stopped/restarted each time a page is loaded.
  yield all([takeEvery('LOAD_PAGE', onLoadPage)]);
}

function configureStore(state = initialState) {
  const store = createStore(reducer, state, bindMiddleware([sagaMiddleware]));
  store.runSagaTask = () => {
    if (_.isNil(store.sagaTask)) {
      console.log('Run, saga!');
      store.sagaTask = sagaMiddleware.run(rootSaga);
    }
  };

  store.stopSagaTask = () => {
    if (!_.isNil(store.sagaTask)) {
      console.log('Saga, stop!');
      store.dispatch(END);
      const { done } = store.sagaTask;
      store.sagaTask = null;
      return done;
    }
  };

  store.runSagaTask();
  return store;
}

const store = configureStore({});

const getInitialProps = async (name) => {
  store.dispatch({ type: 'LOAD_PAGE', payload: { name } });
  const sagaEnd = store.stopSagaTask();
  store.runSagaTask();
  await sagaEnd;
  console.log(`${name} getInitialProps ended.`);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await wait(aLittleTime());
  getInitialProps('home');
  await wait(aLittleTime());
  getInitialProps('news');
  await wait(aLittleTime());
  getInitialProps('contact');
  await wait(aLittleTime());
  getInitialProps('reviews');
  await wait(aLittleTime());
  getInitialProps('games');
}

main();
