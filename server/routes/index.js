module.exports = function(router) {
  'use strict';
  var controller = require('../controllers'),
    app = controller.App;

  /* The API */
  require('./actions')(router, app, controller.Actions);

  /* Test route for the API */
  router.route('/')
    .get(app.filtrate, function(req, res) {
      res.json({
        message: 'Api up and running!'
      })
    })
    .post(app.filtrate, function(req, res) {
      if (req.body.action == 'incoming') {
        res.status(200).json({
          'events': [{
            'event': 'log',
            'message': 'Recieved SMS from: ' + req.body.from
          }]
        });
      } else {
        res.status(200).json({
          'events': [{
            'event': 'log',
            'message': 'A poll was made to the servers'
          }]
        });
      }
    });
  return router;
};
