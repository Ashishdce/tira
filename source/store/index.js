import createStore from './store.js';
import { reducer } from './reducer.js';
import { initialState } from './initialState.js';

export default createStore(reducer, initialState);