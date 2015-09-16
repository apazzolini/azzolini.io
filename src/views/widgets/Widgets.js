import React, {Component, PropTypes} from 'react';
import DocumentMeta from 'react-document-meta';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {initializeWithKey} from 'redux-form';
import * as widgetActions from '../../redux/modules/widgets';
import {isLoaded, load as loadWidgets} from '../../redux/modules/widgets';

const meta = {
  title: 'Widgets Azzolini'
};

@connect(
  state => ({
    widgets: state.widgets.data,
    error: state.widgets.error,
    loading: state.widgets.loading
  }),
  dispatch => ({
    ...bindActionCreators({
      ...widgetActions,
      initializeWithKey
    }, dispatch)
  })
)
export default
class Widgets extends Component {
  static propTypes = {
    widgets: PropTypes.array,
    error: PropTypes.string,
    loading: PropTypes.bool,
    initializeWithKey: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
  }

  render() {
    const {widgets, error, loading, load} = this.props;
    let refreshClassName = 'fa fa-refresh';
    if (loading) {
      refreshClassName += ' fa-spin';
    }
    return (
      <div>
        <DocumentMeta {...meta} />
        <h1>
          Widgets
          <button onClick={load}><i
            className={refreshClassName}/> {' '} Reload Widgets
          </button>
        </h1>
        <p>
          xxThis data was loaded from the server before this route was rendered. If you hit refresh on your browser, the
          data loading will take place on the server before the page is returned. If you navigated here from another
          page, the data was fetched from the client.
        </p>
        <p>
          This widgets are stored in your session, so feel free to edit it and refresh.
        </p>
        {error &&
        <div className="alert alert-danger" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
          {' '}
          {error}
        </div>}
        {widgets && widgets.length &&
        <table className="table table-striped">
          <thead>
          <tr>
            <th>ID</th>
            <th>Color</th>
            <th>Sprockets</th>
            <th>Owner</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          {
            widgets.map((widget) => 
              <tr key={widget.id}>
                <td>{widget.id * 2}</td>
                <td>{widget.color}</td>
                <td>{widget.sprocketCount}</td>
                <td>{widget.owner}</td>
                <td>
                  <button className="btn btn-primary" onClick={::this.handleEdit(widget)}>
                    <i className="fa fa-pencil"/> Edit
                  </button>
                </td>
              </tr>
            )
          }
          </tbody>
        </table>}
      </div>
    );
  }

  handleEdit(widget) {
    const {editStart} = this.props; // eslint-disable-line no-shadow
    return () => {
      editStart(String(widget.id));
    };
  }

  static fetchData(store) {
    if (!isLoaded(store.getState())) {
      return store.dispatch(loadWidgets());
    }
  }
}

