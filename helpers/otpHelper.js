const otpGenerator = require('otp-generator')
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);




const generateOtp = () => {
    return otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false
    })
  }





  module.exports={
    generateOtp
  }