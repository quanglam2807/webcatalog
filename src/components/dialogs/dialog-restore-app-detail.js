/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable object-curly-newline */
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import JSZip from 'jszip';

import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';

import PublishIcon from '@material-ui/icons/Publish';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';
import { close } from '../../state/dialog-restore-app-details/actions';
import getAssetPath from '../../helpers/get-asset';
import { APP_DETAILS_FILENAME } from '../../constants/backups';

const DialogRestoreAppDetails = () => {
  const dispatch = useDispatch();

  const open = useSelector((state) => state.dialogRestoreAppDetails.open);
  const appsList = useSelector((state) => Object.entries(state.appManagement.apps));

  const onClose = useCallback(() => dispatch(close()), [dispatch]);
  const onRestoreAppDetails = useCallback(async () => {
  }, []);

  const onUploadAppDetailsZip = useCallback(async () => {
    const filePaths = window.remote.dialog.showOpenDialogSync({
      filters: [
        { name: 'App Details', extensions: ['.zip'] },
      ],
      properties: ['openFile'],
    });

    if (filePaths && filePaths.length !== 0) {
      const filePath = getAssetPath(filePaths[0]);

      const fileResponse = await fetch(filePath);
      const fileBlob = await fileResponse.blob();

      const appDetailsContent = await JSZip.loadAsync(fileBlob);
      const appDetailsData = await appDetailsContent.files[APP_DETAILS_FILENAME].async('text');
      const appDetails = JSON.parse(appDetailsData);
      console.log(appDetails)
      // appDetails.forEach(([a,]))
    }
  });

  const parseAppDetailsFile = useCallback(async () => {

  });

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth="sm"
    >
      <EnhancedDialogTitle onClose={onClose}>
        Restore Apps & Spaces
      </EnhancedDialogTitle>
      <DialogContent>
        <IconButton
          color="primary"
          onClick={onUploadAppDetailsZip}
        >
          <PublishIcon fontSize="large" />
        </IconButton>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary">
          Restore Apps
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogRestoreAppDetails;
