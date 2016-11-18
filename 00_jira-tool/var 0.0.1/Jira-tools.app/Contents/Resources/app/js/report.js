'use strict';


// var reportApp = angular.module('readUs', []);


var getRequest, todayRequest, tomorrowRequest;

ngModule.controller('MainController2', function ($scope) {
  var main2 = this;
  var today = date.toFormat("YYYY-MM-DD");



  $scope.name = userData.username;
  $scope.today = date.toFormat("MM-DD");

  if(date.toFormat("DDDD") === 'Friday') {
    date.setDate(date.getDate() + 3)
  } else {
    date.setDate(date.getDate() + 1)
  }

  var tomorrow = date.toFormat("YYYY-MM-DD");

  $scope.tomorrow = date.toFormat("MM-DD");
  $scope.year = date.toFormat("YYYY");
  $scope.month = date.toFormat("MM");
  $scope.workday = globalToday.currentday + ' / ' + globalToday.businessday;


  var remainingDay = globalToday.businessday - globalToday.currentday,
      a = Math.floor(30 / remainingDay),
      remainingMinutes = (30 % remainingDay) * 60,
      b = Math.floor(remainingMinutes / remainingDay),
      remainingSeconds = remainingMinutes / remainingDay * 60,
      c = Math.floor(remainingSeconds / remainingDay);

  $scope.averagePosiOvertime = a + ' : ' + b + ' : ' + c;




  getRequest = jiraUtil.get('/rest/tempo-timesheets/3/worklogs?username=' + userData.username + '&dateFrom=' + today + '&dateTo=' + today, userData, function (err, resp, body) {
    if (err) {
      document.getElementById('contents-error').style.display = "block";
    } else {
      todayRequest = jiraUtil.get('/rest/tempo-planning/1/allocation?assigneeKeys=' + userData.username + '&startDate=' + today + '&endDate=' + today, userData, function (err, resp, body2) {
        if (err) {
          document.getElementById('contents-error').style.display = "block";
        } else {
          var keys = [];
          for (var i=0; i<body.length; i++) {
            keys.push(body[i].issue.key);
          }
          for (var i=0; i<body2.length; i++) {
            var key = body2[i].planItem.key
            if (keys.indexOf(key) != -1) {

              for (var m=0; m<body.length; m++) {
                if (key === body[m].issue.key) {
                  body2[i].planItem.summary = '';
                  $.extend(body[m], body2[i]);
                  body2.splice(i, 1);
                  break;
                }
              }
            }
          }

          var array = body.concat(body2);
          $scope.$apply(function () {
            main2.jira = body;
          });
          document.getElementById('contents-load2').style.display = "none";
          document.getElementById('contents-report').style.display = "block";
        }
      });
    }
  });



  tomorrowRequest = jiraUtil.get('/rest/tempo-planning/1/allocation?assigneeKeys=' + userData.username + '&startDate=' + tomorrow + '&endDate=' + tomorrow, userData, function (err, resp, body) {
    if (err) {
      document.getElementById('contents-error').style.display = "block";
    } else {
      $scope.$apply(function () {
        main2.plan2 = body;
      });
      document.getElementById('contents-load2').style.display = "none";
      document.getElementById('contents-report').style.display = "block";
    }
  });

});


window.addEventListener('beforeunload', function() {
    getRequest.abort();
    todayRequest.abort();
    tomorrowRequest.abort();
});

// var refresh = document.getElementById('refresh');
// refresh.addEventListener('click', function(){
//   getRequest;
// });


  // ------------------------------
  // copy
  // ------------------------------

$(function(){
  var $button = $('#copy_button');
  $button.on('click', function(){
    var $report = $('#contents-report'),
        idname = $report.attr("id");

    if (idname !== undefined) {
      var range = document.createRange(),
          element = document.getElementById(idname),
          selection;

      range.selectNodeContents(element);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();

      return false;
    }
  });
});
