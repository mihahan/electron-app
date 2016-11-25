var $ = require('jquery'),
    chart = require('../renderer/chart.js');

var app = angular.module('myApp.directive', ['myApp']);

app.directive("drawing", ['appConfig', 'planConfig', function(appConfig, planConfig){
  return {
    restrict: "A",
    link: function(scope, element){
      scope.$watch('value.chartNum', function(){
        var user = $(element).data('user');
        if(user) {
          chart.create(planConfig.datas[user], user, appConfig.weekdays, element[0].id);
        } else {
          $(element).parent('.ng-scope').hide();
        }
      }, true)

    }
  };
}]);


app.directive("reportnav", ['appConfig', 'reportConfig', function(appConfig, reportConfig){
  if(location.href.split('#/')[1] === 'monthly') {
    reportConfig.reportName = 'Monthly';
    reportConfig.start = appConfig.formattedToday.YM + '-01';
    reportConfig.end = appConfig.formattedToday.YM + '-' + (appConfig.monthDates[appConfig.formattedToday.M]-1);
  } else {
    reportConfig.start = appConfig.monday;
    reportConfig.end = appConfig.friday;
  }
  return function(scope, element, attr){
    element[0].addEventListener("click", function(){
      reportConfig.reportName = $(element).attr('reportnav');
      if (reportConfig.reportName == 'Weekly') {
        reportConfig.start = appConfig.monday;
        reportConfig.end = appConfig.friday;
      } else if (reportConfig.reportName == 'Monthly') {
        reportConfig.start = appConfig.formattedToday.YM + '-01';
        reportConfig.end = appConfig.formattedToday.YM + '-' + (appConfig.monthDates[appConfig.formattedToday.M]-1);
      }
    });
  }
}]);


app.directive("operationnav", ['appConfig', 'operationConfig', function(appConfig, operationConfig){
  operationConfig.start = appConfig.formattedToday.YM + '-01';
  operationConfig.end = appConfig.formattedToday.YM + '-' + (appConfig.monthDates[appConfig.formattedToday.M]-1);
  return function(scope, element, attr){
    element[0].addEventListener("click", function(){
      operationConfig.start = appConfig.formattedToday.YM + '-01';
      operationConfig.end = appConfig.formattedToday.YM + '-' + (appConfig.monthDates[appConfig.formattedToday.M]-1);
    });
  }
}]);


app.directive("plannav", ['appConfig', 'planConfig', function(appConfig, planConfig){
  if(location.href.split('#/')[1] === 'plan-all') {
    planConfig.name = 'Users';
    planConfig.users = appConfig.users;
  }
  return function(scope, element, attr){
    element[0].addEventListener("click", function(){
      planConfig.name = $(element).attr('plannav');
      if (planConfig.name == 'Myself') {
        planConfig.users = [appConfig.userData.username];
      } else if (planConfig.name == 'Users') {
        planConfig.users = appConfig.users;
      }
    });
  }
}]);

// app.directive('navigation', function() {
//   return {
//     priority: 0,
//     restrict: "A",
//     replace: false,
//     transclude: false,
//     scope: false,
//     controller: "NavController"
//   };
// });


app.directive("planitem", function(){
  return {
    templateUrl: '../template/plan.html'
  };
});


app.directive("operationitem", function(){
  return {
    templateUrl: '../template/operation.html'
  };
});
