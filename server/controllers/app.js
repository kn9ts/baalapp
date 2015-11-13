'use strict';
var jwt = require('jsonwebtoken'),
  uuid = require('uuid'),
  App = function() {};

App.prototype = {
  status: function(req, res) {
    return res.status(200).json({
      message: 'Welcome to the Baal API'
    });
  },
  filtrate: function(req, res, next) {
    if (req.body.action === 'incoming') {
      next();
    }

    var Messages = req.app.get('models').Messages;
    if (req.body.action === 'send_status') {
      Messages.getByIdAndUpdate(req.body.id, {
        sent: true
      }).exec(function(err, msg) {
        if (err) {
          return res.json({
            'events': [{
              'event': 'log',
              'message': err.message
            }]
          });
        }

        if (msg) {
          var message = 'Message Id:' + req.body.id + ' was sent succesfully.';
          return res.json({
            'events': [{
              'event': 'log',
              'message': message
            }]
          });
        }
      });
    }

    if (req.body.action === 'outgoing') {
      Messages.where({
          sent: false
        })
        .populate('farmer', '_id name.first phonenumber')
        .exec(function(err, messages) {
          if (err) {
            return res.json({
              'events': [{
                'event': 'log',
                'message': err.message
              }]
            });
          }
          if (messages) {
            console.log(messages);
            var sendTheseMessages = messages.map(function(msg, i) {
              return {
                'id': msg._id,
                'to': msg.farmer.phonenumber,
                'message': msg.content
              };
            });

            return res.status(200).json({
              'events': [{
                'event': 'send',
                'messages': sendTheseMessages
              }]
            });
          } else {
            return res.json({
              'events': [{
                'event': 'log',
                'message': 'No messages queued to send out'
              }]
            });
          }
        });
    }
  }
};

module.exports = new App();
