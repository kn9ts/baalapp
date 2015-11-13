'use strict';
var uuid = require('uuid'),
  tomatoes = require('../data/tomatoes.json'),
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
              nextMessageToSend = 'Which is the closest major town to you? This will help us understand the weather in that area.';
              break;

              // His/her location
            case 3:
              user.location = req.body.message;
              user.steps++;

              var landsize = parseFloat(user.landsize.match(/(\d{1,})(\.)?(\d{1,})?/g)[0]),
                totalcost = (tomatoes.cumulativeCost * landsize),
                weeklycost = totalcost / (tomatoes.days / 7),
                harvest = totalcost * 4;

              nextMessageToSend = 'The total cost over a period of ' + tomatoes.days + ' days(almost 4 months) for the tomatoes to mature will be ksh. ' + totalcost + '. Which is approximately ksh. ' + weeklycost + ' every week. In return you will harvest worth ksh. ' + harvest;

              var Messages = req.app.get('models').Messages;
              var newMessage = new Messages({
                content: 'So ' + user.name.first + ', when do you want to begin?',
                farmer: user._id
              });
              newMessage.save();

            case 4:
              user.steps++;
              var landsize = parseFloat(user.landsize.match(/(\d{1,})(\.)?(\d{1,})?/g)[0]),
                seedBags = (100 * user.landsize) / 0.125,
                priceforSeeds = seedBags * 100;

              nextMessageToSend = 'Things to purchase: ' + seedBags + ' seed packages(kilele F1 or faulu) - Ksh. 100 for 100grams, you will need ksh. ' + priceforSeeds + ' for your land, plastic rolls for making seedling bags. Fertiliser(DAP) or if you have chickens use their waste.';
          }
        }

        // if no user was found and no errors popped up
        // sweet spot
        if (!user && !err) {
          // check 2 names were submitted
          if (!/(\s){1,}/.test(req.body.message)) {
            nextMessageToSend = 'Please provide us with your two names.';
            return res.json({
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
          }

          // if all is cool sign them up
          user = new Users({
            phonenumber: req.body.from,
            name: {
              full: req.body.message
            },
            steps: 1
          });

          nextMessageToSend = 'Hi ' + user.name.first + ', what crop do you want to grow?';
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
