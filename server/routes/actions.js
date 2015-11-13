'use strict';
module.exports = function(api, controller) {
  api.route('/actions').post(controller.actions)
};
