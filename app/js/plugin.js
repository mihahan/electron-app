(function($) {

  var $view = $('#view_report'),
      // baseUrl = 'https://rbank.backlog.jp',
      baseUrl = 'https://rbank.backlog.jp',
      customArr = ['name', 'apiKey'],
      reportArr = ['impression', 'toeic', 'holiday', 'etc'],
      formData = {
        'impression': '<span>所管をここに記入</span>',
        'tOver': '-',
        'toeic': '-',
        'holiday': '-',
        'etc': '-',
        'table_today' : {},
        'table_tomorrow' : {}
      },
      tables = ['today', 'tomorrow'],
      tableData = {
        'issueKeys' : {
          'today': (localStorage.getItem('bk_dr--today_issueKeys')) ? localStorage.getItem('bk_dr--today_issueKeys').split(",") : [],
          'tomorrow': (localStorage.getItem('bk_dr--tomorrow_issueKeys')) ? localStorage.getItem('bk_dr--tomorrow_issueKeys').split(",") : []
        }
      };

  var methods = {
    parameter : {
      init: function(option) {
        if (option) {
          var param = '?',
              arrayParam = function(name, array) {
                for (var i = 0; i < array.length; i++) {
                  param =　param + name + '[' + i + ']=' + array[i] + '&';
                }
              };

          for (var key in option) {
            if (key === 'projectId[]') {
              arrayParam('projectId', option[key]);
            } else if (key === 'assigneeId[]') {
              arrayParam('assigneeId', option[key]);
            } else if (key === 'statusId[]') {
              arrayParam('statusId', option[key]);
            } else {
              param =　param + key + '=' + option[key] + '&';
            }
          }
          param = param.substr( 0, param.length-1 ) ;
          return param;
        }
      }
    },
    requestAPI : {
      get: function(option) {
        option = $.extend({
          api: null,
          parameter: '',
          type: 'GET',
          key: null
        }, option);

        var value = [];

        $.ajax({
          url: baseUrl + option.api + option.parameter,
          type: option.type,
          dataType: 'json',
          jsonpCallback: 'callback',
          async: false,
          cache: true
        }).done(function(data, textStatus, request) {
          $(data).each(function(){
            value.push(this[option.key]);
          });
        }).fail(function(xhr, textStatus, errorThrown){
          //fail
        });
        return value;
      },
      create: function(option) {
        option = $.extend({
          api: null,
          parameter: '',
          type: 'GET'
        }, option);

        $.ajax({
          url: baseUrl + option.api + option.parameter,
          type: option.type,
          dataType: 'json',
          jsonpCallback: 'callback',
          async: false,
          cache: true
        }).done(function(data, textStatus, request) {
          console.log(data);
          $.extend(formData, globalToday);

          var remainingDay = formData.businessday - formData.currentday,
              a = Math.floor(30 / remainingDay),
              remainingMinutes = (30 % remainingDay) * 60,
              b = Math.floor(remainingMinutes / remainingDay),
              remainingSeconds = remainingMinutes / remainingDay * 60,
              c = Math.floor(remainingSeconds / remainingDay);

          formData.averagePosiOvertime = [a, b, c];

          $view.html(''); // delete prev report
          $view.append($('#tmpl_report').tmpl(formData));

          for (var i = 0; i < tables.length; i++) {


            $(data).each(function(){
              // add new data Table
              if (formData['table_' + tables[i]] == {} || tableData.issueKeys[tables[i]].indexOf(this.issueKey) == -1) {
                this.date = formData.format;
                this.bu = ' ';
                this.projectID = ' ';
                this.hoge = ' ';
                this.url = 'https://rbank.backlog.jp/view/' + this.issueKey;

                var issueStartY, issueStartM, issueStartD,
                    issueEndY, issueEndM, issueEndD;

                if (this.startDate !== null) {
                  this.startDate = this.startDate.substr(0, 10);
                  issueStartY = Number(this.startDate.substr(0, 4)),
                  issueStartM = Number(this.startDate.substr(5, 2)),
                  issueStartD = Number(this.startDate.substr(8, 2));
                } else {
                    $('#table_' + tables[i]).find('tbody').append($('#tmpl_task').tmpl(this));
                }
                if (this.dueDate !== null) {
                  issueEndY = Number(this.dueDate.substr(0, 4)),
                  issueEndM = Number(this.dueDate.substr(5, 2)),
                  issueEndD = Number(this.dueDate.substr(8, 2));
                }

                // if (issueStartY <= formData.year && issueStartM <= formData.month && issueStartD <= formData.day) {
                //   if (this.dueDate === null || (issueEndY >= formData.year && issueEndM >= formData.month && issueEndD >= formData.day)) {
                    $('#table_' + tables[i]).find('tbody').append($('#tmpl_task').tmpl(this));
                //   }
                // }
              }

            });

            // 更新・削除
            // for (var m = 0; m < tableData.issueKeys[tables[i]].length; m++) {
            //   var issueKey = tableData.issueKeys[tables[i]][m],
            //       datas = formData['table_' + tables[i]][issueKey];
            //   if (formData['table_' + tables[i]][issueKey]){
            //     datas.date = formData.format;
            //     if (issueKey.slice(0, 1) === 'R') {
            //       datas.url = 'https://rbank.backlog.jp/view/' + this.issueKey;
            //     }
            //     $view.find('#table_' + tables[i] + ' tbody').append($('#tmpl_task').tmpl(datas));
            //   }
            // }
          }

        }).fail(function(xhr, textStatus, errorThrown){
          if ($('[data-strage="apiKey"]').val() === '') {
            $view.html('API キーを入力してください');
          } else {
            $view.html('API キーが正しいか確認してください');
          }
        });
      }
    },
    saveData : {
      init: function() {
        formData.name = $('[data-strage="name"]').val();
        localStorage.setItem('bk_dr--name', formData.name);
        localStorage.setItem('bk_dr--apiKey', $('[data-strage="apiKey"]').val());
      },
      strage: function() {
        var value;

        formData.name = $('[data-strage="name"]').val();
        localStorage.setItem('bk_dr--name', formData.name);
        localStorage.setItem('bk_dr--apiKey', $('[data-strage="apiKey"]').val());

        for (var i = 0; i < reportArr.length; i++) {
          if (i === 0) {
            // localStorage.setItem('bk_dr--' + reportArr[i], $('[data-strage="' + reportArr[i] + '"]').innerHTML());???
            // 所管おとき
            //
            //
            //
          } else {
            value = $('[data-strage="' + reportArr[i] + '"]').val();
            if (value) {
              localStorage.setItem('bk_dr--' + reportArr[i], String(value));
              formData[reportArr[i]] = value;
            }
          }
        }
      },
      table: function(table) {
        var $this = $(this),
            $target,
            issueKey = $this.data('id'),
            $td = $this.find('td'),
            html = issueKey + ',';

        for (var i = 0; i < $td.length; i++) {
          $target = $td.eq(i);
          if ($target.hasClass('select')) {
            html = html + $target.find('select').val() + ',';
          } else if ($target.hasClass('edit_area')) {
            html = html + $target.find('.edit_form').val() + ',';
          } else {
            html = html + $target.text() + ',';
          }
          if (i === $td.length - 1) {
            localStorage.setItem('bk_dr--' + table + '_' + issueKey, html);
            if (tableData.issueKeys[table].indexOf(issueKey) == -1) {
              tableData.issueKeys[table].push(issueKey);
            }
            localStorage.setItem('bk_dr--' + table +'_issueKeys', tableData.issueKeys[table].join(','));
          }
        }
      }
    },
    setData : {
      init: function() {
        var value;
        for (var i = 0; i < customArr.length; i++) {
          value = localStorage.getItem('bk_dr--' + customArr[i]);
          if (value) $('[data-strage="'+ customArr[i] +'"]').val(value);
        }
      },
      report: function() {
        var value;
        for (var i = 0; i < reportArr.length; i++) {
          value = localStorage.getItem('bk_dr--' + reportArr[i]);
          if (value) formData[reportArr[i]] = localStorage.getItem('bk_dr--'+ reportArr[i]);
        }
      },
      table: function() {
        var itemName = ['issueKey', 'date', 'bu', 'summary', 'projectID', 'hoge', 'detail', 'predetermined', 'actualtime', 'other'],
            items,
            value;


        for (var m = 0; m < tables.length; m++) {

          for (var i = 0; i < tableData.issueKeys[tables[m]].length; i++) {
            value = localStorage.getItem('bk_dr--' + tables[m] +'_' + tableData.issueKeys[tables[m]][i]);
            if (value) {
              items = value.split(',');
              formData['table_' + tables[m]][tableData.issueKeys[tables[m]][i]] = {};
              for (var x = 0; x < items.length; x++) {
                formData['table_' + tables[m]][tableData.issueKeys[tables[m]][i]][itemName[x]] = items[x];
              }
            }
          }
        }
      }
    }
  };

  // --------------------------------------------------
  // plugin
  // --------------------------------------------------
  $.fn.pluginCommon = function(method, arguments, name) {
    if ( methods[name][method] ) {
      return methods[name][method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else {
      return methods[name].init.apply( this, arguments );
    }
  }
  $.fn.parameter = function(method) {
    return this.pluginCommon(method, arguments, 'parameter');
  };
  $.fn.requestAPI = function(method) {
    return this.pluginCommon(method, arguments, 'requestAPI');
  };
  $.fn.saveData = function(method) {
    return this.pluginCommon(method, arguments, 'saveData');
  };
  $.fn.setData = function(method) {
    return this.pluginCommon(method, arguments, 'setData');
  };


})(jQuery);
