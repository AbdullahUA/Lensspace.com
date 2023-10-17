const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },

    is_blocked:{
        type:Number,
        required:true,
        default:false
    },
      referralCode: {
    type: String,
    unique: true,
    required: true,
  },
  referrals: [{
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User collection
    },
    dateReferred: {
      type: Date,
      default: Date.now,
    },
  }],
    wallet:{
        type:Number,
        default:0
    },
    walletTransaction:{
        type:Array
    }
});

module.exports = mongoose.model('User', userSchema)