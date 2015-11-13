'use strict';
var uuid = require('uuid'),
  Actions = function() {};

Actions.prototype = {
  actions: function(req, res, next) {
    var scope = this,
      Users = req.app.get('models').Users;

    // cut down the spaces in the message
    req.body.message.trim().replace(/(\s){2,}/, ' ');

    // check if the user exists
    Users.findOne({
      phonenumber: req.body.from
    }).exec(function(err, user) {
      // if the user was found
      if (!err && user) {
        return scope.processAction(req.body, user);
      }

      // if no user was found and no errors popped up: sweet spot
      if (!user && !err) {
        if (!/(\s)/.test(req.body.message)) {
          return res.json({
            message: 'Please provide us with two names'
          });
        }

        // if all is cool sign them up
        user = new Users({
          phonenumber: req.body.from,
          name: req.body.message.trim()
        });

        user.save(function(err) {
          if (err) {
            res.json({
              message: 'Something went wrong. Please try again.'
            });
          }

          res.status(200).json({
            'events': [{
              'event': 'send',
              'messages': [{
                'id': uuid.v4(),
                'priority': 100,
                'to': req.body.from,
                'message': 'Hi ' + req.body.message + ', what crop do you want to grow?'
              }]
            }]
          });
        });
      }

      // if an error occured
      if (err) {
        return scope.responseToError(err);
      }
    });
  },
  processAction: function(data, user) {
    if (data.action === 'incoming') {

    }
  }
};

module.exports = new Actions();
