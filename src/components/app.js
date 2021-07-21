/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import connectComponent from '../helpers/connect-component';

import SnackbarTrigger from './root/snackbar-trigger';
import TelemetryManager from './root/telemetry-manager';
import Container from './root/container';

import DialogAbout from './dialogs/dialog-about';
import DialogCatalogAppDetails from './dialogs/dialog-catalog-app-details';
import DialogCreateCustomApp from './dialogs/dialog-create-custom-app';
import DialogEditApp from './dialogs/dialog-edit-app';
import DialogBackupAppDetails from './dialogs/dialog-backup-app-details';
import DialogRestoreAppDetails from './dialogs/dialog-restore-app-detail';
import DialogLicenseRegistration from './dialogs/dialog-license-registration';
import DialogOpenSourceNotices from './dialogs/dialog-open-source-notices';
import DialogSetInstallationPath from './dialogs/dialog-set-installation-path';

import {
  requestGetInstalledApps,
  requestCheckForUpdates,
  requestUpdateAuthJson,
} from '../senders';

import { fetchLatestTemplateVersionAsync } from '../state/general/actions';
import { clearUserState, updateUserAsync } from '../state/user/actions';

import firebase from '../firebase';

const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    width: '100vw',
    background: theme.palette.background.default,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  notistackContainerRoot: {
    // substract 22px of FakeTitleBar
    marginTop: window.process.platform === 'darwin' && window.mode !== 'menubar' ? 64 : 42,
  },
});

const App = ({
  classes,
  onClearUserState,
  onUpdateUserAsync,
  onFetchLatestTemplateVersionAsync,
}) => {
  useEffect(() => {
    requestCheckForUpdates(true); // isSilent = true
    requestGetInstalledApps();

    onFetchLatestTemplateVersionAsync();
    const updaterTimer = setTimeout(() => {
      onFetchLatestTemplateVersionAsync();
    }, 15 * 60 * 1000); // recheck every 15 minutes
    return () => {
      clearTimeout(updaterTimer);
    };
  }, [onFetchLatestTemplateVersionAsync]);

  // docs: https://github.com/firebase/firebaseui-web-react
  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        onClearUserState();
        requestUpdateAuthJson();
        return;
      }

      onUpdateUserAsync();
    });
    // Make sure we un-register Firebase observers when the component unmounts.
    return () => unregisterAuthObserver();
  }, [onClearUserState, onUpdateUserAsync]);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <Container />
      </div>

      <SnackbarTrigger />
      <TelemetryManager />

      <DialogAbout />
      <DialogCatalogAppDetails />
      <DialogCreateCustomApp />
      <DialogEditApp />
      <DialogBackupAppDetails />
      <DialogRestoreAppDetails />
      <DialogLicenseRegistration />
      <DialogOpenSourceNotices />
      <DialogSetInstallationPath />
    </div>
  );
};

App.propTypes = {
  classes: PropTypes.object.isRequired,
  onClearUserState: PropTypes.func.isRequired,
  onFetchLatestTemplateVersionAsync: PropTypes.func.isRequired,
  onUpdateUserAsync: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isFullScreen: state.general.isFullScreen,
});

const actionCreators = {
  clearUserState,
  fetchLatestTemplateVersionAsync,
  updateUserAsync,
};

export default connectComponent(
  App,
  mapStateToProps,
  actionCreators,
  styles,
);
