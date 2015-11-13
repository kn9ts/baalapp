'use strict';
module.exports = function(mongoose, Schema) {

  var UserSchema = new Schema({
    // _id: new Schema.Types.ObjectId, // created by Mongodb
    name: {
      first: String,
      last: String
    },
    phonenumber: String,
    planting: {
      type: String,
      lowercase: true,
      trim: true
    },
    location: String,
    hasbegan: Boolean,
    steps: {
      type: Number,
      default: 0
    },
    lastCommunicated: {
      type: Date,
      default: Date.now
    },
    dateCreated: {
      type: Date,
      default: Date.now
    }
  });

  UserSchema.virtual('name.full')
    .set(function(name) {
      var split = name.split(' ');
      this.name.first = split[0];
      this.name.last = split[1];
    })
    .get(function() {
      return this.name.first + ' ' + this.name.last;
    });

  return mongoose.model('Users', UserSchema);
};
