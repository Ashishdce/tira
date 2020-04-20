const validateAction = action => {
  if (!action.type) {
    throw new Error('Not a valid action. Expected type.')
  }
}

const createStore = (reducer, initialState) => {
  const store = {};

  store.state = JSON.parse(localStorage.getItem('tira-state')) || initialState;

  store.listeners = [];
  store.subscribe = (listener) => store.listeners.push(listener);

  store.dispatch = action => {
    validateAction(action);

    store.state = reducer(store.state, action);

    localStorage.setItem('tira-state', JSON.stringify(store.state));

    store.listeners.forEach(listener => listener(action, store.state));
  }

  store.getState = () => store.state;

  return store;
};

export default createStore;