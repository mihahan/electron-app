(function($) {

  $(function(){

    var $window = $(window),
        $document = $(document),
        apiKey,
        assigneeId,
        projectId;

    // ------------------------------
    // initialize
    // ------------------------------
    var initialize = function() {
      apiKey = $('[data-strage="apiKey"]').val();
      assigneeId = $window.requestAPI('get', {
        api: '/api/v2/users/myself',
        parameter: $document.parameter({'apiKey' : apiKey}),
        key: 'id'
      }),
      projectId = $window.requestAPI('get', {
        api: '/api/v2/projects',
        parameter: $document.parameter({'apiKey' : apiKey}),
        key: 'id'
      });
    };

    $window.setData('init');
    $window.setData('report');
    $window.setData('table');
    $window.saveData('init');
    initialize();

    // ------------------------------
    // Request
    // ------------------------------
    var createReport = function() {
      $document.requestAPI('create', {
        api: '/api/v2/issues',
        parameter: $document.parameter({
          'apiKey' : apiKey,
          'projectId[]' : projectId,
          'assigneeId[]' : assigneeId,
          'statusId[]' : [1, 2, 3],
        })
      });
    };


    // ------------------------------
    // Request
    // ------------------------------
    var addEvent = function() {

      $('form').find('input').on('change', function(){
        initialize();
        $(this).saveData('strage');
        createReport();
        addEvent();
        addEventReportArea();
      });

      $('#view_report').find('input, textarea').on('change', function(){
        initialize();
        $(this).saveData('strage');
      });

      var issueKeys, date, stamp;

      $('.add_table').on({
        mouseover: function(){
          $(this).addClass('hover');
        },
        mouseleave: function() {
          $(this).removeClass('hover');
        },
        click: function() {
          issueKeys = localStorage.getItem('bk_dr--issueKeys');
          date = new Date();
          stamp = date.getTime();
          $(this).prev().find('tbody').append($('#tmpl_task').tmpl({
            date: globalToday.format,
            issueKey: stamp,
            bu: ' ',
            projectID: ' ',
            hoge: ' '
          }));
          addEventReportArea();
        }
      });
    };

    // ------------------------------
    // Edit
    // ------------------------------

    var addEventReportArea = function() {
      $('.edit_area').each(function(){
        var $this = $(this),
            $title = $this.prev('label'),
            $view = $this.find('.view_text'),
            $form = $this.find('.edit_form');


        $.fn.editable = function() {
          $(this).on('click', function(){
            if ($view.data('target')=='textarea') {
              $form.css({height: $view.outerHeight()});
            }
            $this.addClass('edit');
            $form.focus();
          });
        };
        $title.editable();
        $view.editable();

        $view.on({
          mouseenter: function(){
            $view.addClass('hover');
          },
          mouseleave: function(){
            $view.removeClass('hover');
          }
        });

        $form.on('blur', function(){
          $this.removeClass('edit');
        });
        $form.on('change', $form, function(){
          $view.html($form.val());
        })
      });
      $('.edit_calendar').each(function(){
        var $this = $(this),
            $view = $this.find('.view_text'),
            $form = $this.find('input');

        $form.datetimepicker({
          timepicker:false,
          format:'m/d',
          onSelectDate: function(){
            $form.val($form.val());
            $view.html($form.val());
          }
        });
      });

      $('[data-role="textarea"]').each(function(){
        var $this = $(this),
            adjust = 6.5;
        $this.css("lineHeight", 1.2);

        $this.on('input',function(e){
          var $target = $(e.target);

          if (e.target.scrollHeight > e.target.offsetHeight) {
            $target.height(e.target.scrollHeight - adjust);
          } else {
            var lineHeight = Number($target.css("lineHeight").split("px")[0]);
            if (($target.height() - lineHeight - adjust) > 0) {
              $target.height($target.height() - lineHeight - adjust);
            }
            if (e.target.scrollHeight > e.target.offsetHeight){
              $target.height(e.target.scrollHeight - adjust);
            }
          }
        });
      });

      $('.data_table').each(function(){
        var $this = $(this),
            $name = $this.data('table');
        $this.find('select, input').on('change', function(){
          var $group = $(this).parents('tr');
          $group.saveData('table', $name);
        });
      });
      $('.function_area').each(function(){
        var $this = $(this),
            $button = $this.find('.button');

        $this.on({
          mouseover: function(){
            $button.removeClass('hide');
          },
          mouseleave: function() {
            $button.addClass('hide');
          },
          click: function() {
            var $target = $this.parents('tr'),
                id = $target.data('id'),
                table = $this.parents('table').data('table');

            $target.hide();
            localStorage.removeItem('bk_dr--' + table + '_' + id)
            return false;
          }
        });
      });

    };

    // ------------------------------
    // call function
    // ------------------------------
    createReport();
    addEvent();
    addEventReportArea();


  });
})(jQuery);
