
var $ = require('jquery');

module.exports.data = function($scope, $rootScope, appConfig, planConfig, jiraUtil, dateFormat) {
  var count = 0;

  var users = $scope.checkboxModel;

  for(var chartNum=0; chartNum < users.length; chartNum++) {
    var requestUrl = '/rest/tempo-planning/1/allocation?assigneeKeys=' + users[chartNum] + '&startDate=' + appConfig.monday + '&endDate=' + appConfig.friday;

    if (planConfig[planConfig.name + 'Flag']) {
      $scope.data = planConfig[planConfig.name + 'Datas'];
      $rootScope.loaded();
    } else {
      jiraUtil.get(requestUrl, appConfig.userData, function (err, resp, body) {
        if (err) {
          $('.contents-error').show();
        } else {
          var planItems = [],
              count = 0;
          for (var i=0; i < body.length; i++) {
            var day = body[i].start,
                key = body[i].planItem.key,
                summary = body[i].planItem.summary,
                plantime = body[i].seconds / 3600,
                username = body[0].assignee.key;

            if (summary.indexOf('間接作業') != -1) {
              summary = summary.replace('間接作業', '間');
            }

            if (body[i].start === body[i].end) {
              planItems[count] = {
                'day': day,
                'key': key,
                'summary': summary,
                'plantime': plantime
              };
            } else {
              var startDay = body[i].start.split('-')[2] - 0,
                  num = dateFormat.getStatusDay(body[i].end).currentday - dateFormat.getStatusDay(body[i].start).currentday + 1,
                  array = dateFormat.getBusinessDayArray(body[i].start, body[i].end);
              for(var m=0; m<num; m++) {
                day = body[i].end.split('-')[0] + '-' + body[i].end.split('-')[1] + '-' + ('0' + (startDay + array[m])).slice(-2);
                planItems[count + m] = {
                  'day': day,
                  'key': key,
                  'summary': summary,
                  'plantime': plantime / num
                };
              }
              count = count + num - 1;
            }
            count++;
          }

          var dayText = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              weekdayLength = 5;
          planConfig.datas[username] = [];
          for (var x=0; x<weekdayLength; x++) {
            planConfig.datas[username][x] = {
              'day': appConfig.weekdays[x],
              'DDDD': dayText[x],
              'items': [],
              'sum': 0
            };
            for (var n=0; n<planItems.length; n++) {
              if (planConfig.datas[username][x].day === planItems[n].day) {
                planConfig.datas[username][x].items.push(planItems[n]);
              }
            }
            for (var z=0; z<planConfig.datas[username][x].items.length; z++) {
              planConfig.datas[username][x].sum += planConfig.datas[username][x].items[z].plantime;
            }
          }
          planConfig[planConfig.name + 'Datas'].push({
            'datas': planConfig.datas[username],
            'username': username
          });


          if (chartNum == users.length) {

            $scope.$apply(function () {
              $scope.data = planConfig[planConfig.name + 'Datas'];
              $rootScope.loaded();
            });
          }
          planConfig[planConfig.name + 'Flag'] = true
        }
      });

    }
  }
};
