
var request = require('request');

var formData = require('form-data');



module.exports.get = function (url, userData, cb) {
  return request.get({
      url: 'https://jira.rakuten-it.com/jira' + url,
      auth: {
          user: userData.username,
          pass: userData.password
      },
      body: {
          scm: "hg",
          is_private: true
      },
      json: true
  }, function(err, resp, body) {
    if (err) {
      cb(err, null);
      return;
    }

    cb(null, null, body);
  });
};

module.exports.post = function (url, userData, formData, cb) {
  request({
      url: 'https://jira.rakuten-it.com/jira' + url,
      auth: {
          user: userData.username,
          pass: userData.password
      },
      method: 'POST',
      headers: {
        'Content-Type':'application/json'
      },
      body: formData,
      json: true
  }, function(err, resp, body){
    cb(err, resp, body);
  });
};


