import { combineReducers } from 'redux';
import {reducer as form} from 'redux-form';
import info from './info';
import widgets from './widgets';

export default combineReducers({
  form,
  info,
  widgets
});
