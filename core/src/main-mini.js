import AppLight from './AppLight.html';
import { LuigiConfig, LuigiI18N, LuigiElements } from './core-api';
import { writable, readable } from 'svelte/store';
import { version } from '../package.json';

const createConfigStore = () => {
  const { subscribe, update, reset } = writable({});
  const scopeSubscribers = {};
  return {
    subscribe,
    update,
    reset,
    subscribeToScope: (fn, scope) => {
      let subscribers = scopeSubscribers[scope];
      if (!subscribers) {
        subscribers = new Set();
        scopeSubscribers[scope] = subscribers;
      }
      subscribers.add(fn);
    },
    fire: (scope, data) => {
      let subscribers = scopeSubscribers[scope];
      if (subscribers) {
        [...subscribers].forEach(fn => {
          fn(data);
        });
      }
    }
  };
};

export const store = createConfigStore();
export const getTranslation = readable((key, interpolations, locale) => {
  return LuigiI18N.getTranslation(key, interpolations, locale);
});

Luigi._store = store;

const configReadyCallback = () => {
  return new Promise(resolve => {
    LuigiI18N._init();
    // setTimeout needed so that luigi container is rendered when we retrieve it
    let app;
    setTimeout(() => {
      if (LuigiElements.isCustomLuigiContainer()) {
        document
          .getElementsByTagName('html')[0]
          .classList.add('luigi-app-in-custom-container');
      }

      app = new AppLight({
        target: LuigiElements.getLuigiContainer(),
        props: {
          store,
          getTranslation
        }
      });

      resolve();
    });
  });
};

LuigiConfig.setConfigCallbacks(configReadyCallback);
