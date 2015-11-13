'use strict';
var uuid = require('uuid'),
  Actions = function() {};

Actions.prototype = {
  actions: function(req, res, next) {
    var Users = req.app.get('models').Users;

    // cut down the spaces in the message
    req.body.message.trim().replace(/(\s){2,}/, ' ');

    // check if the user exists
    Users.findOne({
        phonenumber: req.body.from.trim()
      })
      .exec(function(err, user) {
        if (err && !user) {
          return res.json({
            'events': [{
              'event': 'log',
              'message': err.message
            }]
          });
        }

        var nextMessageToSend;
        // if the user was found
        if (!err && user) {
          switch (user.steps) {
            // What is he wants to plant?
            case 1:
              user.planting = req.body.message;
              user.steps++;
              nextMessageToSend = 'What\'s the size of the land in acres you want to grow ' + user.planting + '? If below or more than 1 acre use decimal places. eg. 0.25';
              break;

              // Size of his.her land
            case 2:
              user.landsize = req.body.message;
              user.steps++;
              nextMessageToSend = 'Which is the closest town to you? This will help us understand the weather in that area.';
              break;

              // His/her location
            case 3:
              user.location = req.body.message;
              user.steps++;

              var tomatoes = require('../data/tomatoes.json'),
                landsize = parseFloat(user.landsize.match(/(\d{1,})(\.)?(\d{1,})?/g)[0]),
                totalcost = (tomatoes.cumulativeCost * landsize),
                weeklycost = totalcost / (tomatoes.days / 7),
                harvest = totalcost * 4;

              nextMessageToSend = 'The total cost over a period of ' + tomatoes.days + ' days(almost 4 months) for the tomatoes to mature will be ksh. ' + totalcost + '. Which is approximately ksh. ' + weeklycost + ' every week. In return you will harvest worth ksh. ' + harvest;
          }
        }

        // if no user was found and no errors popped up
        // sweet spot
        if (!user && !err) {
          // check 2 names were submitted
          if (!/(\s){1,}/.test(req.body.message)) {
            return res.json({
              message: 'Please provide us with two names'
            });
          }

          // if all is cool sign them up
          user = new Users({
            phonenumber: req.body.from,
            name: {
              full: req.body.message
            },
            steps: 1
          });

          nextMessageToSend = 'Hi ' + req.body.message + ', what crop do you want to grow?';
        }

        user.save(function(err) {
          if (err) {
            res.json({
              'events': [{
                'event': 'log',
                'message': err.message
              }]
            });
          }

          res.status(200).json({
            'events': [{
              'event': 'send',
              'messages': [{
                'id': uuid.v4(),
                'priority': 100,
                'to': req.body.from,
                'message': nextMessageToSend
              }]
            }]
          });
        });
      });
  }
};

module.exports = new Actions();
