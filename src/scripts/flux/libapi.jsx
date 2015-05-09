'use strict';

var _ = require('lodash');
var request = require('superagent');

var config = require('../config.jsx')();

function get(sql) {
  return new Promise(function(resolve, reject) {
    request.get('https://www.googleapis.com/fusiontables/v1/query')
      .set({ Referer: 'http://localhost:3000' })
      .query({ key: config.get('apiKey') })
      .query({ sql: sql })
      .end(function(err, res) {
        err ? reject(err) : resolve(res);
      });
  });
}

function post(sql) {
  return new Promise(function(resolve, reject) {
    request.post('https://www.googleapis.com/fusiontables/v1/query')
      .set({ Referer: 'http://localhost:3000' })
      .query({ key: config.get('apiKey') })
      .query({ sql: sql })
      .end(function(err, res) {
        err ? reject(err) : resolve(res);
      });
  });
}

var LibAPI = {
  fetchICD10: function() {
    return get('select code, description from ' + config.get('tables').get('icd10') + ' order by code');
  },
  fetchCauses: function() {
    return get('select ROWID from 1pH9j1Kq5x6SlyvHyznV5dbaLC2tT8prxUlO_LAMG where AgeYear = 999');
  },
  updateCause: function(values, rowId) {
    var sql = 'update 1pH9j1Kq5x6SlyvHyznV5dbaLC2tT8prxUlO_LAMG set ';
    sql += _.map(values, function(value, key) {
      return key + ' = ' + (value === null ? "''" : "'" + value + "'");
    }).join(', ');
    sql += " where ROWID = '" + rowId + "'";
    return post(sql);
  }
};

module.exports = LibAPI;
