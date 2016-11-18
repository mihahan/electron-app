var $ = require('jquery'),
    chart = require('../renderer/chart.js');

var app = angular.module('myModule');

app.directive("drawing", ['$rootScope', function($rootScope){
  return {
    restrict: "A",
    link: function(scope, element){
      scope.$watch('value.chartNum', function(){
        var user = $(element).data('user');
        if(user) {
          chart.create($rootScope['PlanDatas'][user], user, $rootScope.weekdays, element[0].id);
        } else {
          $(element).parent('.ng-scope').hide();
        }
      }, true)

    }
  };
}]);

app.directive('navigation', function() {
  return {
    priority: 0,
    restrict: "A",
    replace: false,
    transclude: false,
    scope: false,
    controller: "NavController"
  };
});


app.directive("planitem", function(){
  return {
    templateUrl: '../template/plan.html'
  };
});


