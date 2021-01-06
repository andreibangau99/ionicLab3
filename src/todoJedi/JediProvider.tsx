import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { JediProps } from './JediProps';
import { createJedi, getJedis, newWebSocket, updateJedi } from './JediApi';
import { AuthContext } from '../auth';
import {useNetwork} from "./jediUseNetwork";
import {addToStorage, getListFromStorage, removeFromStorage} from "../localStorage/localStorageApi";

const log = getLogger('ItemProvider');

type SaveJediFn = (jedi: JediProps) => Promise<any>;
type RefreshFunctionFn = () => Promise<any>;
export interface JediState {
  jedis?: JediProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveItem?: SaveJediFn,
  refresh?: RefreshFunctionFn,
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
const FETCH_JEDIS_SUCCEEDED_STORAGE = 'FETCH_JEDIS_SUCCEEDED_STORAGE';
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
          addToStorage("jedis", payload.items);
          return { ...state, jedis: payload.items, fetching: false };
        case FETCH_JEDIS_SUCCEEDED_STORAGE:
          addToStorage("jedis", payload.items);
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
          let jedis: JediProps[] = [];
          items.forEach(x=>{
            if (x._id && x._id.length>0)
              jedis.push(x) });
          addToStorage("jedis", jedis);
          return { ...state, jedis: items, saving: false };
        case SAVE_JEDI_FAILED:
          const { error,jedi_original } =  payload.param
          console.log(error.message);
          console.log(jedi_original)
          const itemsf = [...(state.jedis || [])];

          const indexf = itemsf.findIndex(it => it._id === jedi_original._id);
          if (indexf === -1) {
            itemsf.splice(0, 0, jedi_original);
          } else {
            itemsf[indexf] = jedi_original;
          }
          let jedisf: JediProps[] = [];
          itemsf.forEach(x=>{jedisf.push(x) });
          addToStorage("jedis", jedisf);
          return { ...state,jedis:jedisf, savingError: payload.error, saving: false };
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
  const { networkStatus } = useNetwork();
  const saveItem = useCallback<SaveJediFn>(saveItemCallback, [token]);
  const refreshFunction = useCallback<RefreshFunctionFn>(refreshCallback,[token]);
  const value = { jedis, fetching, fetchingError, saving, savingError, saveItem};
  log('returns');
  return (
      <JediContext.Provider value={value}>
        {children}
      </JediContext.Provider>
  );

  function getItemsEffect() {
    let canceled = false;
    console.log("in fetch items: "+networkStatus.connected)
    try{
      if (networkStatus.connected)
        fetchItems();
      else
      {
        fetchItemsFromStorage();
      }
    }catch (error){
      log("error: "+ error);
      fetchItemsFromStorage();
    }
    return () => {
      canceled = true;
    }
    async function refreshCallback(){
      getItemsEffect();
    }
    async function fetchItemsFromStorage(){
      log('fetchItems from storage started');
      dispatch({ type: FETCH_JEDIS_STARTED });
      try{
        const myJedi = (await (getListFromStorage('jedis')));
        log("jedis from storage:  " + myJedi)

        log('fetchJedis succeeded from storage');
        if (!canceled) {
          dispatch({ type: FETCH_JEDIS_SUCCEEDED_STORAGE, payload: { jedis: myJedi } });
        }
      }catch(error){
        log('fetchJedis failed');
        dispatch({ type: FETCH_JEDIS_FAILED, payload: { error } });
      }
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
  async function refreshCallback(){
    getItemsEffect();
  }
  async function saveItemCallback(item: JediProps) {
    try {
      console.log('saveItem started');
      dispatch({ type: SAVE_JEDI_STARTED });
      const savedItem = await (item._id ? updateJedi(token, item) : createJedi(token, item));
      log('saveItem succeeded');
      dispatch({ type: SAVE_JEDI_SUCCEEDED, payload: { item: savedItem } });
    } catch (error) {
      console.log('on save error');
      var local_data: JediProps[] = await(getListFromStorage("local_data"))
      //var jedisL: JediProps[] = await(getListFromStorage("jedis"))
      log(local_data)
      if (local_data) {
        console.log(item)
        console.log(local_data)
        var index = local_data.findIndex(it => it._id === item._id)
        //var indexJ = jedisL.findIndex(it => it._id === item._id)
        console.log("index..." + index)
        if (item._id && item._id.length > 0)
          item.status = 2;
        else
          item.status = 1;
        if (index === -1){
          console.log("** "+index)
          local_data.splice(0, 0, item);
        }
        else {
          console.log("## "+index);
          local_data[index] = item;

        }
        // if(indexJ>0){
        //   jedisL[indexJ]=item
        // }
      }


      addToStorage("local_data", local_data);
      // removeFromStorage('jedis');
      // addToStorage("jedis",jedisL);
      // getItemsEffect();
      var param = {error : error, jedi_original: item};
      console.log("param: "+param)
      dispatch({ type: SAVE_JEDI_FAILED, payload: { param } });

    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim() && networkStatus.connected) {
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
