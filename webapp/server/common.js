const AWS = require("aws-sdk");
// AWS
AWS.config.update({
  region: "eu-west-2"
});

module.exports.AWS = AWS;
