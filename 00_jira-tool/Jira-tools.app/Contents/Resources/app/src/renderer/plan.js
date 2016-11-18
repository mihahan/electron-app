module.exports.data = function($scope, $rootScope, users, jiraUtil, userData, dateFormat, loaded, FlagName, dataName) {

  var count = 0;

  if (!$rootScope[FlagName]) {
    $rootScope[dataName] = [];
  }
  if (!$rootScope.PlanDatas) {
    $rootScope.PlanDatas = {};
  }
  for(var chartNum=0; chartNum < users.length; chartNum++) {
    var requestUrl = '/rest/tempo-planning/1/allocation?assigneeKeys=' + users[chartNum] + '&startDate=' + $rootScope.monday + '&endDate=' + $rootScope.friday;

    if ($rootScope[FlagName]) {
      $scope.data = $rootScope[dataName];
      loaded();
    } else {
      jiraUtil.get(requestUrl, userData, function (err, resp, body) {
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
          $rootScope.PlanDatas[username] = [];
          for (var x=0; x<weekdayLength; x++) {
            $rootScope.PlanDatas[username][x] = {
              'day': $rootScope.weekdays[x],
              'DDDD': dayText[x],
              'items': [],
              'sum': 0
            };
            for (var n=0; n<planItems.length; n++) {
              if ($rootScope.PlanDatas[username][x].day === planItems[n].day) {
                $rootScope.PlanDatas[username][x].items.push(planItems[n]);
              }
            }
            for (var z=0; z<$rootScope.PlanDatas[username][x].items.length; z++) {
              $rootScope.PlanDatas[username][x].sum += $rootScope.PlanDatas[username][x].items[z].plantime;
            }
          }

          $rootScope[dataName].push({
            'datas': $rootScope.PlanDatas[username],
            'username': username
          });


          if (chartNum == users.length) {

            $scope.$apply(function () {
              $scope.data = $rootScope[dataName];
              loaded();
            });
          }
          $rootScope[FlagName] = true
        }
      });

    }
  }
};
