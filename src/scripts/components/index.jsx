'use strict';

var _ = require('lodash');
var React = require('react');
var slug = require('slug');
var Spinner = require('spin.js');
var Immutable = require('immutable');

var LibAPI = require('../flux/libapi.jsx');
var Actions = require('../flux/actions.jsx');
var Store = require('../flux/store.jsx');

var config = require('../config.jsx')();

slug.defaults.mode = 'rfc3986';

var Index = React.createClass({
  componentWillMount: function() {
    Store.addChangeListener(this._onChange);
  },
  componentDidUpdate: function() {
    if (this.state.fetching) {
      this.state.spinner = new Spinner().spin($('#plants').get(0));
    } else {
      if (this.state.spinner != null) {
        this.state.spinner.stop();
      }
      this.state.spinner = null;
    }
  },
  componentWillUnmount: function() {
    Store.removeChangeListener(this._onChange);

    if (this.state.spinner != null) {
      this.state.spinner.stop();
    }
  },
  _onChange: function() {
    this.setState({ data: Store.getData() });
  },
  getInitialState: function() {
    var state = {
      data: Store.getData(),
      fetching: false,
      spinner: null
    };
    return state;
  },
  render: function() {
    return (<div>
      <div className="page-header">
        <div className="container">
          <h2>Home</h2>
        </div>
      </div>

      <div className="container">
        Content
      </div>
    </div>);
  }
});

module.exports = Index;
