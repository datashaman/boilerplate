'use strict';

var Immutable = require('immutable');

module.exports = function() {
  return Immutable.fromJS({
    site: {
      title: 'Boilerplate',
      email: 'marlinf@datashaman.com',
      description: 'Boilerplate application',
      url: process.env.SITE_URL || 'http://localhost:3000',
      baseurl: process.env.SITE_BASEURL || ''
    },
    navbar: [
      {
        url: '/',
        title: 'Home'
      }, {
        url: '/settings/',
        title: 'Settings'
      }
    ],
    apiKey: 'AIzaSyBUE58hcq5yxNE_-tL-YCGPdfZ39mYgKTw',
    tables: {
      icd10: '199_jO7QswhJzgW5A2QiDtNvhA6tMVK2nFkEA7WhV',
      causes: '1pH9j1Kq5x6SlyvHyznV5dbaLC2tT8prxUlO_LAMG'
    }
  });
};
