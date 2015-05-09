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
    ]
  });
};
