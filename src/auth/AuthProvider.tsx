import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { login as loginApi } from './authApi';
import {Plugins} from "@capacitor/core";
import {refresh} from "ionicons/icons";

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;
export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  logout?:LogoutFn;
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: '',
};

export const { Storage } = Plugins;
export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
  const login = useCallback<LoginFn>(loginCallback, []);
  const logout = useCallback<LogoutFn>(logoutCallback, []);
  useEffect(authenticationEffect, [pendingAuthentication]);
  const value = { isAuthenticated, login,logout, isAuthenticating, authenticationError, token };
  log('render');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
  function logoutCallback(): void {
    const { username} = state;
    log("logout");
    (async () => {
      await Storage.remove({key: 'token'});
    })();
    setState({
      ...state,
      isAuthenticated: false,
      token: "",
    });

  }
  function loginCallback(username?: string, password?: string): void {
    log('login');
    setState({
      ...state,
      pendingAuthentication: true,
      username,
      password
    });
  }

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    return () => {
      canceled = true;
    }

    async function authenticate() {




      const oldToken= await Storage.get({key:'token'});
      if(oldToken.value!==null){
        console.log("refresh");
        setState({
          ...state,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
          token: oldToken.value,
        });

      }
      else{
        if (!pendingAuthentication) {
          log('authenticate, !pendingAuthentication, return');
          return;
        }
        try {
          log('authenticate...');
          setState({
            ...state,
            isAuthenticating: true,
          });
          const { username, password } = state;
          const {token}  = await loginApi(username, password);
          Storage.set({key:'token',value:token});
          if (canceled) {
            return;
          }
          log('authenticate succeeded');
          setState({
            ...state,
            token,
            pendingAuthentication: false,
            isAuthenticated: true,
            isAuthenticating: false,
          });
        } catch (error) {
          if (canceled) {
            return;
          }
          log('authenticate failed');
          setState({
            ...state,
            authenticationError: error,
            pendingAuthentication: false,
            isAuthenticating: false,
          });
        }
      }

    }


  }
};
