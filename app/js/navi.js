(function($) {
  $(function(){

    var $button = $('#button'),
        $report = $('#view_report');


    $('#menu').each(function(){
      var $this = $(this);

      $this.find('a').on('click', function(){
        var target = '#' + $(this).data('target');
        if ($(target).hasClass('hide')) {
          $('.panel').addClass('hide');
          $(target).removeClass('hide');
        } else {
          $(target).addClass('hide');
        }
        return false;
      });

      $('.panel').on('mouseleave', function() {
        $(this).addClass('hide');
      });
    });

    $('#delete-strage-btn').on('click', function(){
      localStorage.clear();
      location.reload();
    });



    // ------------------------------
    // Tooltip
    // ------------------------------
    $button.on({
      powerTipPreRender: function() {
        $(this).data('powertip', 'クリップボードにコピーしました。');
      }
    });

    $button.powerTip({
      placement: 'n',
      fadeInTime: 800,
      fadeOutTime: 800,
      manual: true
    });

    // ------------------------------
    // Button
    // ------------------------------
    $button.on('click', function(){
      var $report_copy = $('#view_report_copy'),
          idname = $report_copy.attr("id");

      $report_copy.html($report.html());
      $report_copy.show();
      $report_copy.find('select').remove();

      if (idname !== undefined) {
        var range = document.createRange(),
            element = document.getElementById(idname),
            selection;

        range.selectNodeContents(element);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();

        $report_copy.hide();

        $.powerTip.show($button);
        setTimeout(function(){
          $.powerTip.hide($button);
        }, 2500);

        return false;
      }
    });


  });
})(jQuery);
