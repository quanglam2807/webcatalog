/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import ImportExportIcon from '@material-ui/icons/ImportExport';
import RefreshIcon from '@material-ui/icons/Refresh';
import RestoreIcon from '@material-ui/icons/Restore';
import SortIcon from '@material-ui/icons/Sort';

import connectComponent from '../../../helpers/connect-component';

import { fetchLatestTemplateVersionAsync } from '../../../state/general/actions';
import { getOutdatedAppsAsList } from '../../../state/app-management/utils';
import { updateAllApps } from '../../../state/app-management/actions';
import { open as openBackupAppDetailsDialog } from '../../../state/dialog-backup-app-details/actions';
import { open as openRestoreAppDetailsDialog } from '../../../state/dialog-restore-app-details/actions';

import {
  requestGetInstalledApps,
  requestSetPreference,
} from '../../../senders';

const styles = (theme) => ({
  root: {
    display: 'flex',
    height: 36,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  left: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statusText: {
    marginRight: theme.spacing(1),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
});

const Toolbar = ({
  activeQuery,
  appsList,
  classes,
  fetchingLatestTemplateVersion,
  onFetchLatestTemplateVersionAsync,
  onUpdateAllApps,
  onOpenBackupAppDetailsDialog,
  onOpenRestoreAppDetailsDialog,
  outdatedAppCount,
  registered,
  sortInstalledAppBy,
}) => (
  <div className={classes.root}>
    <div className={classes.left}>
      {activeQuery.length > 0 ? (
        <Typography variant="body2" color="textSecondary" className={classes.statusText}>
          Search results for
          &quot;
          {activeQuery}
          &quot;
        </Typography>
      ) : (
        <>
          <Typography variant="body2" color="textSecondary" className={classes.statusText}>
            <span>{outdatedAppCount}</span>
            <span>&nbsp;Pending Updates</span>
          </Typography>
          <Button
            onClick={onUpdateAllApps}
            size="small"
            disabled={outdatedAppCount < 1}
          >
            Update All
          </Button>
        </>
      )}
    </div>
    <div className={classes.right}>
      {registered && (
        <>
          {(appsList.length !== 0) && (
            <Tooltip title="Back up...">
              <IconButton
                size="small"
                aria-label="Back up..."
                onClick={onOpenBackupAppDetailsDialog}
              >
                <ImportExportIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {
            <Tooltip title="Restore apps...">
              <IconButton
                size="small"
                aria-label="Restore apps..."
                onClick={onOpenRestoreAppDetailsDialog}
              >
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
        </>
      )}
      <Tooltip title="Sort by...">
        <IconButton
          size="small"
          aria-label="Sort by..."
          onClick={() => {
            const sortOptions = [
              { val: 'name', name: 'Sort by Name (A-Z)' },
              { val: 'name/desc', name: 'Sort by Name (Z-A)' },
              { val: 'last-updated', name: 'Sort by Last Updated' },
            ];

            const template = sortOptions.map((sortOption) => ({
              type: 'checkbox',
              label: sortOption.name,
              click: () => requestSetPreference('sortInstalledAppBy', sortOption.val),
              checked: sortOption.val === sortInstalledAppBy,
            }));
            const menu = window.remote.Menu.buildFromTemplate(template);
            menu.popup(window.remote.getCurrentWindow());
          }}
        >
          <SortIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Refresh">
        <IconButton
          size="small"
          aria-label="Refresh"
          onClick={() => {
            onFetchLatestTemplateVersionAsync();
            requestGetInstalledApps();
          }}
          disabled={fetchingLatestTemplateVersion}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  </div>
);

Toolbar.defaultProps = {
  activeQuery: '',
};

Toolbar.propTypes = {
  activeQuery: PropTypes.string,
  appsList: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  fetchingLatestTemplateVersion: PropTypes.bool.isRequired,
  onOpenBackupAppDetailsDialog: PropTypes.func.isRequired,
  onOpenRestoreAppDetailsDialog: PropTypes.func.isRequired,
  onFetchLatestTemplateVersionAsync: PropTypes.func.isRequired,
  onUpdateAllApps: PropTypes.func.isRequired,
  outdatedAppCount: PropTypes.number.isRequired,
  registered: PropTypes.bool.isRequired,
  sortInstalledAppBy: PropTypes.string.isRequired,
};

const actionCreators = {
  fetchLatestTemplateVersionAsync,
  openBackupAppDetailsDialog,
  openRestoreAppDetailsDialog,
  updateAllApps,
};

const mapStateToProps = (state) => ({
  activeQuery: state.installed.activeQuery,
  appsList: state.appManagement.apps,
  fetchingLatestTemplateVersion: state.general.fetchingLatestTemplateVersion,
  registered: state.preferences.registered,
  sortInstalledAppBy: state.preferences.sortInstalledAppBy,
  outdatedAppCount: getOutdatedAppsAsList(state).length,
});

export default connectComponent(
  Toolbar,
  mapStateToProps,
  actionCreators,
  styles,
);
