/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import appManagement from './app-management/reducers';
import dialogAbout from './dialog-about/reducers';
import dialogCatalogAppDetails from './dialog-catalog-app-details/reducers';
import dialogCreateCustomApp from './dialog-create-custom-app/reducers';
import dialogEditApp from './dialog-edit-app/reducers';
import dialogBackupAppDetails from './dialog-backup-app-details/reducers';
import dialogRestoreAppDetails from './dialog-restore-app-details/reducers';
import dialogLicenseRegistration from './dialog-license-registration/reducers';
import dialogOpenSourceNotices from './dialog-open-source-notices/reducers';
import dialogSetInstallationPath from './dialog-set-installation-path/reducers';
import general from './general/reducers';
import installed from './installed/reducers';
import preferences from './preferences/reducers';
import router from './router/reducers';
import systemPreferences from './system-preferences/reducers';
import updater from './updater/reducers';
import user from './user/reducers';

const rootReducer = combineReducers({
  appManagement,
  dialogAbout,
  dialogCatalogAppDetails,
  dialogCreateCustomApp,
  dialogEditApp,
  dialogBackupAppDetails,
  dialogRestoreAppDetails,
  dialogLicenseRegistration,
  dialogOpenSourceNotices,
  dialogSetInstallationPath,
  general,
  installed,
  preferences,
  router,
  systemPreferences,
  updater,
  user,
});

const configureStore = (initialState) => createStore(
  rootReducer,
  initialState,
  applyMiddleware(thunkMiddleware),
);

// init store
const store = configureStore();

export default store;
