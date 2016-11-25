
module.exports.data = function($scope, $rootScope, appConfig, reportConfig, jiraUtil, start, end, FlagName, dataName) {
  var count = 0;
  for(var userCount=0; userCount < appConfig.users.length; userCount++) {
    var requestUrl = '/rest/tempo-timesheets/3/worklogs?username=' + appConfig.users[userCount] + '&dateFrom=' + start + '&dateTo=' + end;

    if (reportConfig[FlagName]) {
      if (reportConfig[dataName].length === 0) {
        $rootScope.nodata();
      } else {
        $scope.data = reportConfig[dataName];
        $rootScope.loaded();
      }
    } else {
      jiraUtil.get(requestUrl, appConfig.userData, function (err, resp, body) {
        if (err) {
          $('.contents-error').addClass('active');
        } else {
          var keys = [];
          var data = {};
          for (var i=0; i < body.length; i++) {
            var spentTime = body[i].timeSpentSeconds/3600,
                username = body[0].author.name;
            if (username !== undefined) {
              if (keys.indexOf(body[i].issue.key) != -1) {
                data[body[i].issue.key].timeSpentSeconds = data[body[i].issue.key].timeSpentSeconds + spentTime;
              } else {
                keys.push(body[i].issue.key);
                data[body[i].issue.key] = {
                  'key': body[i].issue.key,
                  'summary': body[i].issue.summary,
                  'timeSpentSeconds': spentTime
                };
              }
            }
            if (i === body.length - 1) {
              reportConfig[dataName].push({
                'datas': data,
                'username': username
              });
            }
          }

          if (userCount == appConfig.users.length) {
            $scope.$apply(function () {
              $scope.data = reportConfig[dataName];
              $rootScope.loaded();
            });
          }
          if (reportConfig[dataName].length === 0) {
            $rootScope.nodata();
          }
          reportConfig[FlagName] = true;
        }
      });

    }
  }
};
