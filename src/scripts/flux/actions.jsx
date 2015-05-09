var Immutable = require('immutable');

var AppDispatcher = require('./dispatcher.jsx');
var Constants = require('./constants.jsx');

module.exports = {
  fetchData: function() {
    AppDispatcher.dispatch({
      actionType: Constants.FETCH_DATA
    });
  }
};
