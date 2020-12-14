import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { JediProps } from './JediProps';
import { createJedi, getJedis, newWebSocket, updateJedi } from './JediApi';
import { AuthContext } from '../auth';

const log = getLogger('ItemProvider');

type SaveJediFn = (jedi: JediProps) => Promise<any>;

export interface JediState {
  jedis?: JediProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveItem?: SaveJediFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: JediState = {
  fetching: false,
  saving: false
};

const FETCH_JEDIS_STARTED = 'FETCH_JEDIS_STARTED';
const FETCH_JEDIS_SUCCEEDED = 'FETCH_JEDIS_SUCCEEDED';
const FETCH_JEDIS_FAILED = 'FETCH_JEDIS_FAILED';
const SAVE_JEDI_STARTED = 'SAVE_JEDI_STARTED';
const SAVE_JEDI_SUCCEEDED = 'SAVE_JEDI_SUCCEEDED';
const SAVE_JEDI_FAILED = 'SAVE_JEDI_FAILED';

const reducer: (state: JediState, action: ActionProps) => JediState =
    (state, { type, payload }) => {
      switch (type) {
        case FETCH_JEDIS_STARTED:
          return { ...state, fetching: true, fetchingError: null };
        case FETCH_JEDIS_SUCCEEDED:
          return { ...state, jedis: payload.items, fetching: false };
        case FETCH_JEDIS_FAILED:
          return { ...state, fetchingError: payload.error, fetching: false };
        case SAVE_JEDI_STARTED:
          return { ...state, savingError: null, saving: true };
        case SAVE_JEDI_SUCCEEDED:
          const items = [...(state.jedis || [])];
          const item = payload.item;
          const index = items.findIndex(it => it._id === item._id);
          if (index === -1) {
            items.splice(0, 0, item);
          } else {
            items[index] = item;
          }
          return { ...state, jedis: items, saving: false };
        case SAVE_JEDI_FAILED:
          return { ...state, savingError: payload.error, saving: false };
        default:
          return state;
      }
    };

export const JediContext = React.createContext<JediState>(initialState);

interface JediProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const JediProvider: React.FC<JediProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { jedis, fetching, fetchingError, saving, savingError } = state;
  useEffect(getItemsEffect, [token]);
  useEffect(wsEffect, [token]);
  const saveItem = useCallback<SaveJediFn>(saveItemCallback, [token]);

  const value = { jedis, fetching, fetchingError, saving, savingError, saveItem};
  log('returns');
  return (
      <JediContext.Provider value={value}>
        {children}
      </JediContext.Provider>
  );

  function getItemsEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetchItems started');
        dispatch({ type: FETCH_JEDIS_STARTED });

        const items = await getJedis(token);
        log('fetchItems succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_JEDIS_SUCCEEDED, payload: { items } });
        }



      } catch (error) {
        log('fetchItems failed');
        dispatch({ type: FETCH_JEDIS_FAILED, payload: { error } });
      }
    }
  }

  async function saveItemCallback(item: JediProps) {
    try {
      log('saveItem started');
      dispatch({ type: SAVE_JEDI_STARTED });
      const savedItem = await (item._id ? updateJedi(token, item) : createJedi(token, item));
      log('saveItem succeeded');
      //dispatch({ type: SAVE_JEDI_SUCCEEDED, payload: { item: savedItem } });
    } catch (error) {
      log('saveItem failed');
      dispatch({ type: SAVE_JEDI_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: item } = message;
        log(`ws message, item ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_JEDI_SUCCEEDED, payload: { item } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};
