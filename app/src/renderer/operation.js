
var $ = require('jquery');
var dateFormat = require('../renderer/dateFormat.js');

module.exports.data = function($scope, $rootScope, appConfig, operationConfig, jiraUtil, dateFormat) {
  var count = 0;

  var startDate = operationConfig.date.toFormat('YYYY-MM') + '-01',
      endDate = operationConfig.date.toFormat('YYYY-MM') + '-' +appConfig.monthDates[Number(operationConfig.date.toFormat('M'))-1];

  var users = operationConfig.users;
  for(var chartNum=0; chartNum < users.length; chartNum++) {
    var requestUrl = '/rest/tempo-planning/1/allocation?assigneeKeys=' + users[chartNum] + '&startDate=' + startDate + '&endDate=' + endDate;

    console.log(requestUrl)

    if (operationConfig.flag) {
      $scope.data = operationConfig.sum;
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


            if (body[i].start === body[i].end) {
              planItems[count] = {
                'day': day,
                'key': key,
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
                  'plantime': plantime / num
                };
              }
              count = count + num - 1;
            }
            count++;
          }

          var length = appConfig.monthDates[Number(operationConfig.date.toFormat('M'))-1],
              days = dateFormat.thisMonthDays(operationConfig.date);
          var tempDatas = [];
          for (var x=0; x<length; x++) {
            tempDatas[x] = {
              'day': days[x],
              'items': [],
              'sum': 0
            };
            for (var n=0; n<planItems.length; n++) {
              if (tempDatas[x].day === planItems[n].day) {
                tempDatas[x].items.push(planItems[n]);
              }
            }
            for (var z=0; z<tempDatas[x].items.length; z++) {
              tempDatas[x].sum += tempDatas[x].items[z].plantime;
              if (z === tempDatas[x].items.length - 1) {
                // if(username === 'b-tomomi.b.shimada') {

                //   tempDatas[x].sum = Math.ceil(tempDatas[x].sum/6*100);
                // } else {
                //   tempDatas[x].sum = Math.ceil(tempDatas[x].sum/7.5*100);
                // }
              }
            }
          }
          operationConfig.datas.push({
            'datas': tempDatas,
            'username': username
          });


          if (chartNum == users.length) {
            var sum = [];
            var startPosi = dateFormat.startDDDDNum(startDate);
            var length = appConfig.monthDates[Number(operationConfig.date.toFormat('M'))-1];
            for(var k=0; k < operationConfig.datas.length; k++) {
              for(var c=0; c<startPosi; c++) {
                sum[c] = {
                  'day': '-',
                  'sum': '-',
                  'class': 'none'
                };
              }
              for (var b=startPosi; b<length + startPosi; b++) {
                if(k===0) {
                  sum[b] = {
                    'day': operationConfig.datas[k].datas[b-startPosi]['day'],
                    'sum': 0,
                    'class': 'available'
                  };
                }
                sum[b].sum = sum[b].sum + operationConfig.datas[k].datas[b-startPosi]['sum'];
                if(k === operationConfig.datas.length-1) {
                  sum[b].sum = Math.ceil(sum[b].sum/(6+7.5*2)*100);
                  if(sum[b].sum >= 80) {
                    sum[b].class = "alert";
                  } else if(sum[b].sum >= 40) {
                    sum[b].class = "normal";
                  }
                }
              }
            }
            operationConfig.sum = sum;
            console.log(sum);

            $scope.$apply(function () {
              $scope.data = operationConfig.sum
              $rootScope.loaded();
            });
          }
          operationConfig.flag = true
        }
      });

    }
  }
};
