// electron
var electron = require('electron'),
    shell = electron.shell;

// library
var dateUtils = require('date-utils'),
    $ = require('jquery');

var dateFormat = require('../renderer/dateFormat.js');

var app = angular.module('myModule');

app.value('appConfig', {
  // Flag
  'TaskReqFlag': false,
  'ReportReqFlag': false,
  'WeeklyRepFlag': false,
  'MonthlyRepFlag': false,

  // Datas
  'TaskDatas': [],
  'ReportDatas': {
    'sum': 0,
    'sumPlan': 0,
    'sumTmrw': 0,
    'data': null,
    'dataTmrw': null
  },
  'PlanDatas': {},
  // 'MyselfPlanDatas': [],
  // 'UsersPlanDatas': [],
  'WeeklyRepDatas': [],
  'MonthlyRepDatas': [],
  'userData': null,
  'users': ['b-tomomi.b.shimada', 'b-tatsuhiro.a.abe', 'b-hitomi.a.parsi'],

  // setting date
  'date': new Date(),
  'monthDates': dateNum = [31,28,31,30,31,30,31,31,30,31,30,31],

  // get loclstrage
  'userData': JSON.parse(localStorage.getItem('userData'))


});


app.value('reportConfig', {
  'reportName': 'Weekly',
  'start': '',
  'end': ''
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



app.run(['$rootScope','appConfig', 'planConfig', function ($rootScope, appConfig, planConfig) {
  appConfig.formattedToday = {
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
}]);
