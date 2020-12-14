import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { JediProps } from './JediProps';

const jediUrl = `http://${baseUrl}/api/jedi`;

export const getJedis: (token: string) => Promise<JediProps[]> = token => {
  return withLogs(axios.get(jediUrl, authConfig(token)), 'getItems');
}
// export const getItemsByGender: (token: string, gender: string) => Promise<JediProps[]> = (token, gender) => {
//   return withLogs(axios.get(`${jediUrl}/${gender}`, authConfig(token)), 'getItemsByGender');
// }

export const createJedi: (token: string, item: JediProps) => Promise<JediProps[]> = (token, item) => {
  return withLogs(axios.post(jediUrl, item, authConfig(token)), 'createItem');
}

export const updateJedi: (token: string, item: JediProps) => Promise<JediProps[]> = (token, item) => {
  return withLogs(axios.put(`${jediUrl}/${item._id}`, item, authConfig(token)), 'updateItem');
}

interface MessageData {
  type: string;
  payload: JediProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
