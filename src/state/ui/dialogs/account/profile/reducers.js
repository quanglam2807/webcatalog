import { combineReducers } from 'redux';

import {
  DIALOG_ABOUT_CLOSE,
  DIALOG_ACCOUNT_PROFILE_FORM_UPDATE,
  DIALOG_ACCOUNT_PROFILE_SAVE_REQUEST,
  DIALOG_ACCOUNT_PROFILE_SAVE_SUCCESS,
} from '../../../../../constants/actions';

const formInitialState = {
  displayName: '',
  email: '',
};
const form = (state = formInitialState, action) => {
  switch (action.type) {
    case DIALOG_ABOUT_CLOSE: return formInitialState;
    case DIALOG_ACCOUNT_PROFILE_FORM_UPDATE: {
      const { changes } = action;
      return { ...state, ...changes };
    }
    default: return state;
  }
};

const isSaving = (state = false, action) => {
  switch (action.type) {
    case DIALOG_ACCOUNT_PROFILE_SAVE_REQUEST: return true;
    case DIALOG_ACCOUNT_PROFILE_SAVE_SUCCESS: return false;
    default: return state;
  }
};

export default combineReducers({
  form,
  isSaving,
});
