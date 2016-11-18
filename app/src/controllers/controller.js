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
    plan = require('../renderer/plan.js'),
    report = require('../renderer/report.js');

var app = angular.module('myModule');

app
  .controller("MainController", ['$scope', 'appConfig',  function ($scope, appConfig) {

  }])
  .controller("NavController", ['$scope', '$route', '$location', function ($scope, $route, $location) {

    var $nav = $('nav');

    $scope.openChildNav = function(e, option) {
      if (option === 'click') {
        $(e.target).parents('dl').toggleClass('js-open');
        if(!$(e.target).parents('dl').hasClass('js-open')) {
          $(e.target).parents('dl').find('dt').removeClass('active');
          $(e.target).parents('dl').find('dd').removeClass('active');
        }
        // $nav.find('dt').removeClass('active');
        // $nav.find('dd').removeClass('active');
        // $(e.target).parents('dl').find('dt').toggleClass('active');
        // $(e.target).parents('dl').find('dd').toggleClass('active');
      } else {
        $(e.target).parents('dl').find('dt').addClass('active');
        $(e.target).parents('dl').find('dd').addClass('active');
      }
    }
    $scope.closeChildNav = function(e) {
      if(!$(e.target).parents('dl').hasClass('js-open')) {
        $(e.target).parents('dl').find('dt').removeClass('active');
        $(e.target).parents('dl').find('dd').removeClass('active');
        $nav.find('.current dt').addClass('active');
      }
    }
    $scope.$on('$routeChangeSuccess', function () {
      var urlFlagments = $location.$$path.split("/");
      var currentPage = urlFlagments[1];
      if(currentPage == '') {
        currentPage = 'task'
      }
      $scope.currentPage = currentPage;
      $scope.navOpenCurrentPage = currentPage;

      $('[data-status]').removeClass('active');
      $nav.find('dl.current').find('dt').removeClass('active');
      $nav.find('dl.current').find('dd').removeClass('active');
      $nav.find('dl').removeClass('current');
      $nav.find('dt').removeClass('active');

      var $target = $('[data-status=' + currentPage + ']');
      $target.addClass('active');
      $scope.currentPageParent = $target.parents('dl').find('dt').text();
      $target.parents('dl').addClass('current');
      $target.parents('dl').find('dt').addClass('active');
    });
  }])
  .controller('TaskController', ['$scope', 'appConfig', '$rootScope', function($scope, appConfig, $rootScope) {
    var getUrl = '/rest/api/2/search?jql=project = BANKCWDCR AND status = "In Progress" AND assignee in (' + appConfig.userData.username + ')';

    if (appConfig.TaskReqFlag) {
      $scope.data = appConfig.TaskDatas;
      loaded();
    } else {
      jiraUtil.get(getUrl, appConfig.userData, function(err, resp, body) {
        if (err) {
          $('.contents-error').show();
        } else {
          for (var i=0; i < body.issues.length; i++) {
            // body.issues[i].icon = 'issue';
            // if (body.issues[i].fields.labels.indexOf('other') !== -1) {
            //   body.issues[i].icon = 'other';
            // }
            if (body.issues[i].fields.reporter.name !== undefined) {
              body.issues[i].reporter = body.issues[i].fields.reporter.name;
            }
            if (body.issues[i].fields.customfield_12005 !== undefined) {
              body.issues[i].term = body.issues[i].fields.customfield_12005 + '〜' +body.issues[i].fields.customfield_12006;
            }
          }
          appConfig.TaskDatas = body.issues;
          appConfig.TaskReqFlag = true;

          loaded();
          $scope.$apply(function () {
            $scope.data = appConfig.TaskDatas;
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

      jiraUtil.post('/rest/api/2/issue/' + key + '/worklog', appConfig.userData, formData, function (err, resp, body) {
        time.value = '';
        comment.value = '';
        $target.removeClass("status-submit");
      });

    }
  }])
  .controller('ReportController', ['$scope', 'appConfig', '$rootScope', function($scope, appConfig, $rootScope) {


    $scope.name = appConfig.userData.username;
    $scope.today = appConfig.formattedToday.MD;

    var tomorrow = dateFormat.tomorrow(appConfig.date, "YYYY-MM-DD");

    $scope.tomorrow = dateFormat.tomorrow(appConfig.date, "MM-DD");
    $scope.year = appConfig.date.toFormat("YYYY");
    $scope.month = appConfig.date.toFormat("MM");
    $scope.workday = appConfig.globalToday.currentday + ' / ' + appConfig.globalToday.businessday;


    var remainingDay = appConfig.globalToday.businessday - appConfig.globalToday.currentday,
        a = Math.floor(30 / remainingDay),
        remainingMinutes = (30 % remainingDay) * 60,
        b = Math.floor(remainingMinutes / remainingDay),
        remainingSeconds = remainingMinutes / remainingDay * 60,
        c = Math.floor(remainingSeconds / remainingDay);

    $scope.averagePosiOvertime = a + ' : ' + b + ' : ' + c;


    if (appConfig.ReportReqFlag) {
      $scope.sum = appConfig.ReportDatas.sum;
      $scope.sumPlan = appConfig.ReportDatas.sumPlan;
      $scope.todayData = appConfig.ReportDatas.data;
      $scope.tomorrowData = appConfig.ReportDatas.dataTmrw;
      $scope.sumPlanTomorrow = appConfig.ReportDatas.sumTmrw;
      loaded();
    } else {
      var getRequest2 = jiraUtil.get('/rest/tempo-timesheets/3/worklogs?username=' + appConfig.userData.username + '&dateFrom=' + appConfig.formattedToday.YMD + '&dateTo=' + appConfig.formattedToday.YMD, appConfig.userData, function (err, resp, body) {
        if (err) {
          $('.contents-error').show();
        } else {
          var custumRequest = jiraUtil.get('/rest/tempo-planning/1/allocation?assigneeKeys=' + appConfig.userData.username + '&startDate=' + appConfig.formattedToday.YMD + '&endDate=' + appConfig.formattedToday.YMD, appConfig.userData, function (err, resp, body2) {
            if (err) {
              $('.contents-error').show();
            } else {
              var keys = [];
              for (var i=0; i<body.length; i++) {
                appConfig.ReportDatas.sum = appConfig.ReportDatas.sum + body[i].timeSpentSeconds/3600;
                keys.push(body[i].issue.key);
              }
              for (var i=0; i<body2.length; i++) {
                var calc = new Date((+new Date(body2[i].end)) - (+new Date(body2[i].start))),
                    temp = body2[i].seconds/3600/calc.getUTCDate(),
                    key = body2[i].planItem.key;

                body2[i].seconds = temp;
                appConfig.ReportDatas.sumPlan = appConfig.ReportDatas.sumPlan + body2[i].seconds;

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

              $scope.sum = appConfig.ReportDatas.sum;
              $scope.sumPlan = appConfig.ReportDatas.sumPlan;
              appConfig.ReportDatas.data = body.concat(body2);
              appConfig.ReportReqFlag = true;
              loaded();
              $scope.$apply(function () {
                $scope.todayData = appConfig.ReportDatas.data;
              });
            }
          });

        }
      });

      var custumRequest = jiraUtil.get('/rest/tempo-planning/1/allocation?assigneeKeys=' + appConfig.userData.username + '&startDate=' + tomorrow + '&endDate=' + tomorrow, appConfig.userData, function (err, resp, body) {
        if (err) {
          $('.contents-error').show();
        } else {
          for (var i=0; i<body.length; i++) {
            var calc = new Date((+new Date(body[i].end)) - (+new Date(body[i].start)));
            body[i].days = calc.getUTCDate();
            appConfig.ReportDatas.sumTmrw = appConfig.ReportDatas.sumTmrw + body[i].seconds/3600/calc.getUTCDate();
          }
          $scope.sumPlanTomorrow = appConfig.ReportDatas.sumTmrw;
          appConfig.ReportDatas.dataTmrw = body;
          $scope.$apply(function () {
            $scope.tomorrowData = appConfig.ReportDatas.dataTmrw;
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
  }])
  .controller('PlanController', ['$scope', 'appConfig', '$rootScope', 'planConfig', function($scope, appConfig, $rootScope, planConfig) {
    $scope.name = appConfig.userData.username;
    $scope.checkboxModel = planConfig.users;

    plan.data($scope, $rootScope, appConfig, planConfig, jiraUtil, dateFormat, loaded);

    $scope.updateView = function(e) {
      planConfig[planConfig.name + 'Flag'] = false;
      $('.contents-view .ng-scope').html('');
      $('.contents-load').removeClass('disabled');

      plan.data($scope, $rootScope, appConfig, planConfig, jiraUtil, dateFormat, loaded);
      return false;
    }

  }])
  .controller('SummaryRepController', ['$scope', 'appConfig', '$rootScope', 'reportConfig', function($scope, appConfig, $rootScope, reportConfig) {

    var name = reportConfig.reportName;
    $scope.title = name + ' Report';

    $scope.start = reportConfig.start;
    $scope.end = reportConfig.end;

    report.data($scope, appConfig, jiraUtil, loaded, $scope.start, $scope.end, name + 'RepFlag', name + 'RepDatas');

    $scope.updateReport = function(e) {
      appConfig[name + 'RepFlag'] = false;
      $('.contents-view .ng-scope').html('');
      $('.contents-load').removeClass('disabled');
      report.data($scope, appConfig, jiraUtil, loaded, $scope.start, $scope.end, name + 'RepFlag', name + 'RepDatas');
      return false;
    }
  }])





function loaded() {
  $('.contents-load').addClass('disabled');
  $('.contents-view').addClass('active');
}

