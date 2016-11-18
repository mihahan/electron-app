'use strict';

var formatted = date.toFormat("YYYY-MM-DD");

var ngModule = angular.module('myModule', []);

var getRequest


var getUrl = '/rest/api/2/worklog/updated';


var RSS = 'https://jira.rakuten-it.com/jira/activity?maxResults=10&streams=user+IS+b-tomomi.b.shimada&os_authType=basic&title=undefined'



ngModule.controller('MainController', function ($scope) {
  var main = this;

  getRequest = jiraUtil.get(getUrl, userData, function(err, resp, body) {
    if (err) {
      document.getElementById('contents-error').style.display = "block";
    } else {
      $scope.$apply(function () {
        main.jira = body;
      });
      document.getElementById('contents-load').style.display = "none";
      document.getElementById('input').style.display = "block";
    }
  });

});

window.addEventListener('beforeunload', function() {
    getRequest.abort()
})



ngModule.directive('mdPreview', function () {
  return function ($scope, $elem, $attrs) {
    $scope.$watch($attrs.mdPreview, function(source) {
      $elem.html(marked(source));
    });
  };
});


function postTimeSpent(e) {
  var key = e.getAttribute('data-key');
  var comment = document.getElementsByName(key + '-comment')[0];
  var time = document.getElementsByName(key + '-time')[0];
  var formData = {
    "comment": comment.value,
    // "visibility": {
    //     "type": "group",
    //     "value": "jira-developers"
    // },
    // "started": "2016-10-18T11:05:45.000+0000",
    "timeSpentSeconds": parseFloat(time.value) * 60 * 60
  };

  e.classList.add("status-submit");

  jiraUtil.post('/rest/api/2/issue/' + key + '/worklog', userData, formData, function (err, resp, body) {
    console.log(err, resp, body);
    time.value = '';
    comment.value = '';
    e.classList.remove("status-submit");
  });

}

