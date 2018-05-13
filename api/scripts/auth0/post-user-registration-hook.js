/**
@param {object} user - The user being created
@param {string} user.id - user id
@param {string} user.tenant - Auth0 tenant name
@param {string} user.username - user name
@param {string} user.email - email
@param {boolean} user.emailVerified - is e-mail verified?
@param {string} user.phoneNumber - phone number
@param {boolean} user.phoneNumberVerified - is phone number verified?
@param {object} user.user_metadata - user metadata
@param {object} user.app_metadata - application metadata
@param {object} context - Auth0 connection and other context info
@param {string} context.requestLanguage - language of the client agent
@param {object} context.connection - information about the Auth0 connection
@param {object} context.connection.id - connection id
@param {object} context.connection.name - connection name
@param {object} context.connection.tenant - connection tenant
@param {object} context.webtask - webtask context
@param {function} cb - function (error, response)
*/
const request = require('request');

module.exports = function (user, context, cb) {
  request({
    method: 'POST',
    uri: 'http://ec2-52-87-235-251.compute-1.amazonaws.com:8080/record/158e8050-a57e-4a21-923a-320fa8343f2c/dft',
    json: user, 
  }, function(error, response, body) {
    if (error) {
      console.log(error)
      cb();
    } else if (response.statusCode == 200) {
      cb();
    } else {
      console.log("Something went wrong")
      cb();
    }
  })
  console.log(user)
  console.log(context)
};
