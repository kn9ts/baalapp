module.exports = function(router) {
  'use strict';
  var controller = require('../controllers'),
    auth = controller.App.authorise;

  require('./route')(router, auth, controller.Users);

  /* GET the API status */
  router.get('/', auth, controller.App.status);
  return router;
};
