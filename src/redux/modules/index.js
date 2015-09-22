import { combineReducers } from 'redux';
import pages from './pages';
import posts from './posts';

export default combineReducers({
  pages,
  posts
});
