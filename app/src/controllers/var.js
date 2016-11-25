// electron
var electron = require('electron'),
    shell = electron.shell;

// library
var dateUtils = require('date-utils'),
    $ = require('jquery');

var dateFormat = require('../renderer/dateFormat.js');

var app = angular.module('myApp.config', ['myApp', 'ngMaterial', 'ngMessages']);

app.value('appConfig', {
  // Datas
  'userData': null,
  'users': ['b-tomomi.b.shimada', 'b-tatsuhiro.a.abe', 'b-hitomi.a.parsi'],

  // setting date
  'date': new Date(),
  'monthDates': dateNum = [31,28,31,30,31,30,31,31,30,31,30,31],

  // get loclstrage
  'userData': JSON.parse(localStorage.getItem('userData'))
});

app.value('taskConfig', {
  'flag': false,
  'datas': []
});

app.value('reportConfig', {
  'flag': false,
  'datas': {
    'sum': 0,
    'sumPlan': 0,
    'sumTmrw': 0,
    'data': null,
    'dataTmrw': null
  },
  'reportName': 'Weekly',
  'start': '',
  'end': '',
  'WeeklyRepFlag': false,
  'MonthlyRepFlag': false,

  'WeeklyRepDatas': [],
  'MonthlyRepDatas': [],
});

app.value('planConfig', {
  'name': 'Myself',
  'users': '',
  'MyselfFlag': false,
  'UsersFlag': false,
  'datas': {},
  'MyselfDatas': [],
  'UsersDatas': []
});

app.value('operationConfig', {
  'flag': false,
  'users': ['b-tomomi.b.shimada', 'b-tatsuhiro.a.abe', 'b-hitomi.a.parsi'],
  'date': new Date(),
  'datas': [],
  'sum': []
});


app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('pink')
    .accentPalette('orange');
});

app.run(['$rootScope', 'appConfig', 'planConfig', 'reportConfig', function ($rootScope, appConfig, planConfig, reportConfig) {
  appConfig.formattedToday = {
    Y: appConfig.date.toFormat("YYYY"),
    M: appConfig.date.toFormat("MM"),
    YM: appConfig.date.toFormat("YYYY-MM"),
    YMD: appConfig.date.toFormat("YYYY-MM-DD"),
    MD: appConfig.date.toFormat("MM-DD")
  },
  appConfig.weekdays = dateFormat.thisWeekDays(appConfig.date),
  appConfig.monday = appConfig.weekdays[0],
  appConfig.friday = appConfig.weekdays[4],
  appConfig.globalToday = dateFormat.getStatusDay(appConfig.date);

  planConfig.users = [appConfig.userData.username];


  $rootScope.openLink = function(e) {
    shell.openExternal($(e.target).data('href'));
    return false;
  }
  $rootScope.loading = function() {
    $('.contents-nodata').removeClass('active');
  }

  $rootScope.loaded = function() {
    $('.contents-load').addClass('disabled');
    $('.contents-nodata').removeClass('active');
    $('.contents-view').addClass('active');
  }
  $rootScope.nodata = function() {
    $('.contents-load').addClass('disabled');
    $('.contents-nodata').addClass('active');
  }
  $rootScope.resetDairyreport = function() {
    reportConfig.flag = false;
    reportConfig.datas = {
      'sum': 0,
      'sumPlan': 0,
      'sumTmrw': 0,
      'data': null,
      'dataTmrw': null
    };
  }

}]);
