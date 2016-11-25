'use strict';

var app = angular.module('myApp', [
  'ngRoute',
  'myApp.config',
  'myApp.controllers',
  'myApp.directive'
]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'task.html',
        controller: 'TaskController'
    })
    .when('/report', {
        templateUrl: 'report.html',
        controller: 'ReportController'
    })
    .when('/plan', {
        templateUrl: 'plan.html',
        controller: 'PlanController'
    })
    .when('/weekly', {
        templateUrl: 'weekly.html',
        controller: 'SummaryRepController'
    })
    .when('/monthly', {
        templateUrl: 'weekly.html',
        controller: 'SummaryRepController'
    })
    .when('/request', {
        templateUrl: 'request.html'
    })
    .when('/plan-all', {
        templateUrl: 'plan.html',
        controller: 'PlanController'
    })
    .when('/operation', {
        templateUrl: 'operation.html',
        controller: 'OperationController'
    })
    .otherwise({
        templateUrl: '404.html'
    });
}]);
