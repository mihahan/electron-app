'use strict';

var app = angular.module('myModule', ['ngRoute']);

app.config(function($routeProvider) {
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
    .when('/request', {
        templateUrl: 'request.html'
    })
    .when('/plan-all', {
        templateUrl: 'plan-all.html',
        controller: 'PlanAllController'
    })
    .otherwise({
        templateUrl: '404.html'
    });
});
