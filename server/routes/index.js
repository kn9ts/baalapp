module.exports = function(router) {
  'use strict';
  var controller = require('../controllers');

  /* The API */
  require('./actions')(router, controller.Actions);

  /* Test route for the API */
  router.route('/')
    .get(function(req, res) {
      res.json({
        message: 'Api up and running!'
      })
    })
    .post(function(req, res) {
      res.status(200).json({
        'events': [{
          'event': 'log',
          'message': "Recieved SMS from: " + req.body.from
        }]
      });
    });
  return router;
};
