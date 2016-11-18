
module.exports.create = function(data, userName, weekdays, id) {

  var Chart = require('../lib/Chart');
  var ctx = document.getElementById(id);

  var labels = weekdays,
      datas = [0, 0, 0, 0, 0];

  for (var i=0; i<data.length; i++) {
    if (labels.indexOf(data[i].day) != -1) {
      datas[labels.indexOf(data[i].day)] = (data[i].sum);
    }
  }
  Chart.defaults.global.defaultFontColor = '#333';

  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Hours',
          data: datas,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        // responsive: false,
        // maintainAspectRatio: false,
        title: {
          display: true,
          text: userName
        },
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true,
              min: 0,
              max: 10,
              fixedStepSize:7.5,
            }
          }]
        }
      }
  });
}


















