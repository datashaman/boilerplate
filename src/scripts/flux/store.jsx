'use strict';

var _ = require('lodash');
var Cookies = require('cookies-js');
var Immutable = require('immutable');
var { EventEmitter2 } = require('eventemitter2');

var config = require('../config.jsx')();

var constants = require('./constants.jsx');
var AppDispatcher = require('./dispatcher.jsx');
var LibAPI = require('./libapi.jsx');

var defaults = {
};

var data = new Immutable.fromJS(defaults);

var Store = _.assign({}, EventEmitter2.prototype, {
  emitChange: function() {
    return this.emit('change');
  },

  addChangeListener: function(cb) {
    return this.on('change', cb);
  },

  removeChangeListener: function(cb) {
    return this.removeListener('change', cb);
  },

  getData: function() {
    return data;
  },
});

function fetchData() {
  doSomething(function() {
      Store.emitChange();
  });
};

AppDispatcher.register((action) => {
  switch (action.actionType) {
    case constants.FETCH_DATA:
      fetchData();
      break;
  }
});

module.exports = Store;
