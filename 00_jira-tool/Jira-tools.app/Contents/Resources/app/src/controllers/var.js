
var app = angular.module('myModule');


app.factory(function ($rootScope) {
  $rootScope = {
    // Flag
    'TaskReqFlag': false,
    'ReportReqFlag': false,
    'PlanReqFlag': false,
    'PlanReqAllFlag': false,
    // Datas
    'TaskDatas': [],
    'ReportDatas': null,
    'PlanDatas': {},
    'PlanMyDatas': [],
    'PlanAllDatas': [],
    'userData': null
  };
});
