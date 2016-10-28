'use strict';


$(function(){
  $('nav').find('a').each(function(){
    $(this).on('click', function(){
      var $this = $(this),
          $target = $($this.attr('href'));
      $('section').hide();
      $target.show();
      $('nav').find('a').removeClass('active');
      $this.addClass('active');
      return false;
    });
  })
});
