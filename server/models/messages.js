'use strict';
module.exports = function(mongoose, Schema) {
  var Messages = new Schema({
    // _id: new Schema.Types.ObjectId, // created by Mongodb
    content: String,
    dateCreated: {
      type: Date,
      default: Date.now
    },
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'Users'
    },
    sent: {
      type: Boolean,
      default: false
    },
    dateCreated: {
      type: Date,
      default: Date.now
    }
  });

  return mongoose.model('Messages', Messages);
};
