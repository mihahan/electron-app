// electron
var electron = require('electron'),
    remote = electron.remote,
    shell = electron.shell;

// library
var request = require('request'),
    dateUtils = require('date-utils'),
    $ = require('jquery');

var jiraUtil = remote.require('./src/renderer/requestJira.js');

var dom = require('../renderer/dom.js'),
    chart = require('../renderer/chart.js'),
    dateFormat = require('../renderer/dateFormat.js'),
    plan = require('../renderer/plan.js');

var app = angular.module('myModule');

app
  .controller("MainController", ['$scope', '$rootScope', function ($scope, $rootScope) {

    // setting date
    $rootScope.date = new Date(),
    $rootScope.formattedToday = {
      YMD: $rootScope.date.toFormat("YYYY-MM-DD"),
      MD: $rootScope.date.toFormat("MM-DD")
    },
    $rootScope.weekdays = dateFormat.thisWeekDays($rootScope.date),
    $rootScope.monday = $rootScope.weekdays[0],
    $rootScope.friday = $rootScope.weekdays[4],
    $rootScope.globalToday = dateFormat.getStatusDay($rootScope.date);

    // get loclstrage
    $rootScope.userData = JSON.parse(localStorage.getItem('userData'));

  }])
  .controller("NavController", ['$scope', '$route', '$location', function ($scope, $route, $location) {
    $scope.$on('$routeChangeSuccess', function () {
      var urlFlagments = $location.$$path.split("/");
      var currentPage = urlFlagments[1];
      if(currentPage == '') {
        currentPage = 'task'
      }
      $scope.currentPage = currentPage;
      $('[data-status]').removeClass('active');
      $('[data-status=' + currentPage + ']').addClass('active');
    });
  }])
  .controller('TaskController', ['$scope', '$rootScope', function($scope, $rootScope) {
    var getUrl = '/rest/api/2/search?jql=project = BANKCWDCR AND status = "In Progress" AND assignee in (' + $rootScope.userData.username + ')';

    if ($rootScope.TaskReqFlag) {
      $scope.data = $rootScope.TaskDatas;
      loaded();
    } else {
      jiraUtil.get(getUrl, $rootScope.userData, function(err, resp, body) {
        if (err) {
          $('.contents-error').show();
        } else {
          for (var i=0; i < body.issues.length; i++) {
            if (body.issues[i].fields.summary.indexOf('間接') !== -1) {
              body.issues[i].icon = 'other';
            } else {
              body.issues[i].icon = 'issue';
            }
            if (body.issues[i].fields.reporter.name !== undefined) {
              body.issues[i].reporter = body.issues[i].fields.reporter.name;
            }
            if (body.issues[i].fields.customfield_12005 !== undefined) {
              body.issues[i].term = body.issues[i].fields.customfield_12005 + '〜' +body.issues[i].fields.customfield_12006;
            }
          }
          $rootScope.TaskDatas = body.issues;
          $rootScope.TaskReqFlag = true;

          loaded();
          $scope.$apply(function () {
            $scope.data = $rootScope.TaskDatas;
          });
        }
      });
    }

    $scope.postTimeSpent = function(e) {
      var $target = $(e.target)
      var key = $target.data('key');
      var comment = document.getElementsByName(key + '-comment')[0];
      var time = document.getElementsByName(key + '-time')[0];
      var formData = {
        "comment": comment.value,
        "timeSpentSeconds": parseFloat(time.value) * 60 * 60
      };

      $target.addClass("status-submit");

      jiraUtil.post('/rest/api/2/issue/' + key + '/worklog', $rootScope.userData, formData, function (err, resp, body) {
        time.value = '';
        comment.value = '';
        $target.removeClass("status-submit");
      });

    }
    $scope.openLink = function(e) {
      shell.openExternal($(e.target).data('href'));
      return false;
    }
  }])
  .controller('ReportController', ['$scope', '$rootScope', function($scope, $rootScope) {


    $scope.name = $rootScope.userData.username;
    $scope.today = $rootScope.formattedToday.MD;

    var tomorrow = dateFormat.tomorrow($rootScope.date, "YYYY-MM-DD");

    $scope.tomorrow = dateFormat.tomorrow($rootScope.date, "MM-DD");
    $scope.year = $rootScope.date.toFormat("YYYY");
    $scope.month = $rootScope.date.toFormat("MM");
    $scope.workday = $rootScope.globalToday.currentday + ' / ' + $rootScope.globalToday.businessday;


    var remainingDay = $rootScope.globalToday.businessday - $rootScope.globalToday.currentday,
        a = Math.floor(30 / remainingDay),
        remainingMinutes = (30 % remainingDay) * 60,
        b = Math.floor(remainingMinutes / remainingDay),
        remainingSeconds = remainingMinutes / remainingDay * 60,
        c = Math.floor(remainingSeconds / remainingDay);

    $scope.averagePosiOvertime = a + ' : ' + b + ' : ' + c;


    if ($rootScope.ReportReqFlag) {
      $scope.sum = $rootScope.ReportDatas.sum;
      $scope.sumPlan = $rootScope.ReportDatas.sumPlan;
      $scope.todayData = $rootScope.ReportDatas.data;
      $scope.tomorrowData = $rootScope.ReportDatas.dataTmrw;
      $scope.sumPlanTomorrow = $rootScope.ReportDatas.sumTmrw;
      loaded();
    } else {
      $rootScope.ReportDatas = {
        'sum': 0,
        'sumPlan': 0,
        'sumTmrw': 0,
        'data': null,
        'dataTmrw': null
      }
      var getRequest2 = jiraUtil.get('/rest/tempo-timesheets/3/worklogs?username=' + $rootScope.userData.username + '&dateFrom=' + $rootScope.formattedToday.YMD + '&dateTo=' + $rootScope.formattedToday.YMD, $rootScope.userData, function (err, resp, body) {
        if (err) {
          $('.contents-error').show();
        } else {
          var custumRequest = jiraUtil.get('/rest/tempo-planning/1/allocation?assigneeKeys=' + $rootScope.userData.username + '&startDate=' + $rootScope.formattedToday.YMD + '&endDate=' + $rootScope.formattedToday.YMD, $rootScope.userData, function (err, resp, body2) {
            if (err) {
              $('.contents-error').show();
            } else {
              var keys = [];
              for (var i=0; i<body.length; i++) {
                $rootScope.ReportDatas.sum = $rootScope.ReportDatas.sum + body[i].timeSpentSeconds/3600;
                keys.push(body[i].issue.key);
              }
              for (var i=0; i<body2.length; i++) {
                var calc = new Date((+new Date(body2[i].end)) - (+new Date(body2[i].start))),
                    temp = body2[i].seconds/3600/calc.getUTCDate(),
                    key = body2[i].planItem.key;

                body2[i].seconds = temp;
                $rootScope.ReportDatas.sumPlan = $rootScope.ReportDatas.sumPlan + body2[i].seconds;

                if (keys.indexOf(key) != -1) {
                  var itemLength
                  if(body.length > body2.length) {
                    itemLength = body.length;
                  } else {
                    itemLength = body2.length;
                  }

                  for (var m=0; m<itemLength; m++) {
                    if (key === body[m].issue.key) {
                      body2[i].planItem.summary = '';
                      $.extend(body[m], body2[i]);
                      body2.splice(i, 1);
                      i--;
                      break;
                    }
                  }
                }
              }

              $scope.sum = $rootScope.ReportDatas.sum;
              $scope.sumPlan = $rootScope.ReportDatas.sumPlan;
              $rootScope.ReportDatas.data = body.concat(body2);
              $rootScope.ReportReqFlag = true;
              loaded();
              $scope.$apply(function () {
                $scope.todayData = $rootScope.ReportDatas.data;
              });
            }
          });

        }
      });

      var custumRequest = jiraUtil.get('/rest/tempo-planning/1/allocation?assigneeKeys=' + $rootScope.userData.username + '&startDate=' + tomorrow + '&endDate=' + tomorrow, $rootScope.userData, function (err, resp, body) {
        if (err) {
          $('.contents-error').show();
        } else {
          for (var i=0; i<body.length; i++) {
            var calc = new Date((+new Date(body[i].end)) - (+new Date(body[i].start)));
            body[i].days = calc.getUTCDate();
            $rootScope.ReportDatas.sumTmrw = $rootScope.ReportDatas.sumTmrw + body[i].seconds/3600/calc.getUTCDate();
          }
          $scope.sumPlanTomorrow = $rootScope.ReportDatas.sumTmrw;
          $rootScope.ReportDatas.dataTmrw = body;
          $scope.$apply(function () {
            $scope.tomorrowData = $rootScope.ReportDatas.dataTmrw;
          });
        }
      });
    }



    $scope.copyClipboard = function(e) {
      var $target = $(e.target),
          $report = $('#contents-report'),
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
    }
    $scope.openLink = function(e) {
      shell.openExternal($(e.target).data('href'));
      return false;
    }
  }])
  .controller('PlanController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.name = $rootScope.userData.username;
    var users = [$rootScope.userData.username];

    plan.data($scope, $rootScope, users, jiraUtil, $rootScope.userData, dateFormat, loaded, 'PlanReqFlag', 'PlanMyDatas');

      $scope.openLink = function(e) {
        shell.openExternal($(e.target).data('href'));
        return false;
      }
  }])

  .controller('PlanAllController', ['$scope', '$rootScope', function($scope, $rootScope) {

    $scope.name = $rootScope.userData.username;
    var users = ['b-tatsuhiro.a.abe'];
    var users = ['b-tatsuhiro.a.abe', 'b-hitomi.a.parsi', 'b-tomomi.b.shimada'];

    plan.data($scope, $rootScope, users, jiraUtil, $rootScope.userData, dateFormat, loaded, 'PlanReqAllFlag', 'PlanAllDatas');

    $scope.openLink = function(e) {
      shell.openExternal($(e.target).data('href'));
      return false;
    }
  }])





function loaded() {
  $('.contents-load').addClass('disabled');
  $('.contents-view').addClass('active');
}

