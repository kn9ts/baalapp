'use strict';
module.exports = function(api, app, controller) {

  api.route('/actions')
    .post(app.filtrate, controller.actions)

};
