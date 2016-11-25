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
    operation = require('../renderer/operation.js'),
    report = require('../renderer/report.js');



var dialog = remote.dialog;
var BrowserWindow = remote.BrowserWindow;
var fs = require('fs');



var app = angular.module('myApp.controllers', ['myApp', 'ngMaterial', 'ngMessages']);


app
  .controller('MainController', function ($scope, $timeout, $mdSidenav, $log, appConfig, $rootScope) {
    $scope.username = appConfig.userData.username;


    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.toggleRight = buildToggler('right');
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };


    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;

      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
      return debounce(function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }

    function buildToggler(navID) {
      return function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }
    }
  })
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });

    };
  })
  .controller("NavController", ['$scope', '$location', function ($scope, $location) {

    $scope.$on('$routeChangeSuccess', function () {
      var urlFlagments = $location.$$path.split("/"),
          currentPage = urlFlagments[1];

      if(currentPage == '') {
        currentPage = 'task'
      }

      $scope.currentPage = currentPage;
      $scope.navOpenCurrentPage = currentPage;
      $('[data-status]').removeClass('active');
      $('[data-status=' + currentPage + ']').addClass('active');
    });
  }])
  .controller('TaskController', ['$scope', '$rootScope', 'appConfig', 'taskConfig', '$mdDialog', function($scope, $rootScope, appConfig, taskConfig, $mdDialog) {
    var getUrl = '/rest/api/2/search?jql=project = BANKCWDCR AND status = "In Progress" AND assignee in (' + appConfig.userData.username + ')';
    if (taskConfig.flag) {
      $scope.data = taskConfig.datas;
      $rootScope.loaded();
    } else {
      jiraUtil.get(getUrl, appConfig.userData, function(err, resp, body) {
        if (err) {
          $('.contents-error').show();
        } else {
          for (var i=0; i < body.issues.length; i++) {
            taskConfig.datas[i] = {
              'key': body.issues[i].key,
              'icon': 'issue',
              'summary': body.issues[i].fields.summary,
              'reporter': body.issues[i].fields.reporter.name,
              'term': body.issues[i].fields.customfield_12005 + '〜' +body.issues[i].fields.customfield_12006,
              'status': body.issues[i].fields.status.name,
              'id': body.issues[i].id
            }
            if (body.issues[i].fields.labels.indexOf('other') !== -1) {
              taskConfig.datas[i].icon = 'other';
            }
          }
          taskConfig.flag = true;
          $rootScope.loaded();
          $scope.$apply(function () {
            $scope.data = taskConfig.datas;
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
        $rootScope.resetDairyreport();
      });

    }

    $scope.changeStatuModal = function(e) {
      var $target = $(e.target);
      $mdDialog.show({
        controller: 'ChangeStatusCntl',
        templateUrl: '../../src/template/dialog.html',
        parent: angular.element(document.body),
        locals: {
          params: {
            parent: $target.parents('form'),
            key: $target.data('key'),
            summary: $target.data('summary'),
            status: $target.data('status')
          }
         },
        targetEvent: e,
        clickOutsideToClose:true,
        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      });
    }

    $scope.inputPlanModal = function(e) {
      var $target = $(e.target);
      $mdDialog.show({
        controller: 'InputPlanCntl',
        templateUrl: '../../src/template/dialog-plan.html',
        parent: angular.element(document.body),
        locals: {
          params: {
            key: $target.data('key'),
            summary: $target.data('summary'),
            id: $target.data('id')
          }
         },
        targetEvent: e,
        clickOutsideToClose:true,
        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      });
    }
  }])
  .controller('ReportController', ['$scope', '$rootScope', 'appConfig', 'reportConfig', function($scope, $rootScope, appConfig, reportConfig) {


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


    if (reportConfig.flag) {
      $scope.sum = reportConfig.datas.sum;
      $scope.sumPlan = reportConfig.datas.sumPlan;
      $scope.todayData = reportConfig.datas.data;
      $scope.tomorrowData = reportConfig.datas.dataTmrw;
      $scope.sumPlanTomorrow = reportConfig.datas.sumTmrw;
      $rootScope.loaded();
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
                reportConfig.datas.sum = reportConfig.datas.sum + body[i].timeSpentSeconds/3600;
                keys.push(body[i].issue.key);
              }
              for (var i=0; i<body2.length; i++) {
                var calc = new Date((+new Date(body2[i].end)) - (+new Date(body2[i].start))),
                    temp = body2[i].seconds/3600/calc.getUTCDate(),
                    key = body2[i].planItem.key;

                body2[i].seconds = temp;
                reportConfig.datas.sumPlan = reportConfig.datas.sumPlan + body2[i].seconds;

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

              $scope.sum = reportConfig.datas.sum;
              $scope.sumPlan = reportConfig.datas.sumPlan;
              reportConfig.datas.data = body.concat(body2);
              reportConfig.flag = true;
              $rootScope.loaded();
              $scope.$apply(function () {
                $scope.todayData = reportConfig.datas.data;
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
            reportConfig.datas.sumTmrw = reportConfig.datas.sumTmrw + body[i].seconds/3600/calc.getUTCDate();
          }
          $scope.sumPlanTomorrow = reportConfig.datas.sumTmrw;
          reportConfig.datas.dataTmrw = body;
          $scope.$apply(function () {
            $scope.tomorrowData = reportConfig.datas.dataTmrw;
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
  .controller('PlanController', ['$scope', '$rootScope', 'appConfig', 'planConfig', function($scope, $rootScope, appConfig, planConfig) {
    $scope.name = appConfig.userData.username;
    $scope.checkboxModel = planConfig.users;

    plan.data($scope, $rootScope, appConfig, planConfig, jiraUtil, dateFormat);

    $scope.updateView = function(e) {
      planConfig[planConfig.name + 'Flag'] = false;
      planConfig[planConfig.name + 'Datas'] = [];
      $('.plan-items .ng-scope').html('');
      $('.contents-load').removeClass('disabled');

      plan.data($scope, $rootScope, appConfig, planConfig, jiraUtil, dateFormat);
      return false;
    }

  }])

  .controller('OperationController', ['$scope', '$rootScope', 'appConfig', 'operationConfig', function($scope, $rootScope, appConfig, operationConfig) {
    operationConfig.formattedToday = appConfig.formattedToday;
    $scope.month = operationConfig.date.toFormat('YYYY-MM');
    operation.data($scope, $rootScope, appConfig, operationConfig, jiraUtil, dateFormat);

    $scope.prevMonth = function(e) {
      operationConfig.flag = false;
      operationConfig.datas = [];
      if (operationConfig.formattedToday.M === 1) {
        operationConfig.formattedToday.Y = Number(operationConfig.formattedToday.Y) - 1;
        operationConfig.formattedToday.M = 12;
      } else {
        operationConfig.formattedToday.M = Number(operationConfig.formattedToday.M) - 1;
      }
      operationConfig.date = new Date(operationConfig.formattedToday.Y + '-' + operationConfig.formattedToday.M + '-01');
      $scope.month = operationConfig.date.toFormat('YYYY-MM');

      $('.operation-items operationitem .ng-scope').html('');
      $('.contents-load').removeClass('disabled');

      operation.data($scope, $rootScope, appConfig, operationConfig, jiraUtil, dateFormat);
      return false;
    }
    $scope.nextMonth = function(e) {
      operationConfig.flag = false;
      operationConfig.datas = [];
      if (operationConfig.formattedToday.M === 12) {
        operationConfig.formattedToday.Y = Number(operationConfig.formattedToday.Y) + 1;
        operationConfig.formattedToday.M = 1;
      } else {
        operationConfig.formattedToday.M = Number(operationConfig.formattedToday.M) + 1;
      }
      operationConfig.date = new Date(operationConfig.formattedToday.Y + '-' + operationConfig.formattedToday.M + '-01');
      $scope.month = operationConfig.date.toFormat('YYYY-MM');

      $('.operation-items operationitem .ng-scope').html('');
      $('.contents-load').removeClass('disabled');

      operation.data($scope, $rootScope, appConfig, operationConfig, jiraUtil, dateFormat);
      return false;
    }

  }])
  .controller('SummaryRepController', ['$scope', '$rootScope', 'appConfig', 'reportConfig', function($scope, $rootScope, appConfig, reportConfig) {

    var name = reportConfig.reportName;
    $scope.title = name + ' Report';

    $scope.startDay = new Date(reportConfig.start);
    $scope.endDay = new Date(reportConfig.end);


    report.data($scope, $rootScope, appConfig, reportConfig, jiraUtil, $scope.startDay.toFormat('YYYY-MM-DD'), $scope.endDay.toFormat('YYYY-MM-DD'), name + 'RepFlag', name + 'RepDatas');

    $scope.updateReport = function(e) {
      reportConfig[name + 'RepFlag'] = false;
      $('.contents-view .ng-scope').html('');
      $('.contents-load').removeClass('disabled');
      report.data($scope, $rootScope, appConfig, reportConfig, jiraUtil, $scope.startDay.toFormat('YYYY-MM-DD'), $scope.endDay.toFormat('YYYY-MM-DD'), name + 'RepFlag', name + 'RepDatas');
      return false;
    }

    $scope.createReport = function() {
      var screenshot = require('node-webkit-screenshot');

      console.log(screenshot);

      screenshot({
        url : 'http://google.com',
        width : 1024,
        height : 768
      })
      .then(function(buffer){
        console.log(1)
        fs.writeFile('./report/out.png', buffer, function(){
          // This will close the screenshot service
          screenshot.close();
        });
      });

    }
  }])

  .controller('ChangeStatusCntl', ['$scope','appConfig', '$mdDialog', 'params', function($scope, appConfig, $mdDialog, params){
    $scope.key = params.key;
    $scope.summary = params.summary;
    $scope.status = params.status;
    $scope.pressClose = function(){
      $uibModalInstance.close('done');
    };
    $scope.pressDismiss = function(){
      $uibModalInstance.dismiss('done');
    };
    $scope.submit = function(e) {
      var $target = $(e.target),
          key = $scope.key,
          status = $target.find('select').val(),
          formData = {
            "transition": {
              'id': status
            }
          };

      $target.addClass("status-submit");

      jiraUtil.post('/rest/api/2/issue/' + key + '/transitions', appConfig.userData, formData, function (err, resp, body) {
        params.parent.hide();
        $mdDialog.hide();
      });

    }

  }])

  .controller('InputPlanCntl', ['$scope','appConfig', '$mdDialog', 'params', function($scope, appConfig, $mdDialog, params){
    $scope.key = params.key;
    $scope.summary = params.summary;
    $scope.id = params.id;

    $scope.startDay = new Date();
    $scope.endDay = null;
    $scope.pressClose = function(){
      $uibModalInstance.close('done');
    };
    $scope.pressDismiss = function(){
      $uibModalInstance.dismiss('done');
    };
    $scope.submit = function(e) {
      var $target = $(e.target);
      var key = $scope.key;
      var time = $target.find('#time').val();
      var startDate = $target.find('#startDate').val();
      var endDate = $target.find('#endDate').val();
      var formData = {
            "planItem": {
              "id": $scope.id,
              "type": "ISSUE"
            },
            "scope": {
              "id": 52105,
              "type": "project"
            },
            "assignee": {
              "key": appConfig.userData.username,
              "type": "user"
            },
            "commitment": parseFloat(time) * 60 * 60 / 270,
            "start": $scope.startDay.toFormat("YYYY-MM-DD"),
            "end": $scope.endDay.toFormat("YYYY-MM-DD"),
            "recurrence": {
              "rule": "NEVER"
            }
          };
// console.log(parseFloat(time) * 60 * 60 / 270)
      jiraUtil.post('/rest/tempo-planning/1/allocation/', appConfig.userData, formData, function (err, resp, body) {
        $mdDialog.hide();
      });
    }
  }])



.controller('DatepickerPopupDemoCtrl', function ($scope) {
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  $scope.inlineOptions = {
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };
})


  .controller('BasicDemoCtrl', function DemoCtrl($mdDialog) {
    var originatorEv;

    this.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    this.name = 'Creator';
    this.selectMenu = function(e) {
      this.name = $(e.target).text();
      console.log(this.name)
    };

  })







$(function(){
    // ボタンが押されたときの挙動
    $('#hogehoge').on('click', function(){
      var screenshot = require('node-webkit-screenshot');

      screenshot({
        url : location.href,
        width : 1024,
        height : 768
      })
      .then(function(buffer){
        console.log(location.href)
        fs.writeFile('./report/out.png', buffer, function(){
          // This will close the screenshot service
          screenshot.close();
        });
      });
        // var focusedWindow = BrowserWindow.getFocusedWindow();

        // dialog.showOpenDialog(focusedWindow, {
        //     properties: ['openFile'],
        //     filters: [{
        //         name: 'テキストファイル',
        //         extensions: ['txt']
        //     }]
        // }, function(files){
        //     files.forEach(function(file){
        //         console.log(file);
        //     });
        // });
    });

    $('#folderSelect').on('click', function(){
        var focusedWindow = BrowserWindow.getFocusedWindow();

        dialog.showOpenDialog(focusedWindow, {
            properties: ['openDirectory']
        }, function(directories){
            directories.forEach(function(directory){
                console.log(directory);
            });
        });
    });
});

