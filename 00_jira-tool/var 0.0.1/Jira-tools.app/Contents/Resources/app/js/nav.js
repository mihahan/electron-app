'use strict';
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

$(function(){
  $('nav').each(function(){
    var $menu_target = $(this).find('.target'),
        $menu = $(this).find('.menu');

    $menu_target.find('select').on('change', function(){
      $menu_target.find('label').html($(this).find('option:selected').text());
      $('.contents_wrap').hide();
      $('#contents_' + $(this).val()).show();
      $('.menu').hide();
      $('#menu_' + $(this).val()).show();

    });
    $menu.find('a').each(function(){
      var $this = $(this),
          $target = $($this.attr('href'));
      if(!location.hash) {
        $menu.find('a').eq(0).addClass('active');
      }
      if($this.attr('href') === location.hash) {
        $menu.find('a').removeClass('active');
        $this.addClass('active');
        $('section').hide();
        $target.show();
      }

      $this.on('click', function(){
        $('section').hide();
        $target.show();
        $menu.find('a').removeClass('active');
        $this.addClass('active');
      });
    });
  });
});

// var refresh = document.getElementById('refresh');
// refresh.addEventListener('click', function(item, focusedWindow){
//   console.log(location.href);
//   alert('1');
//   location.reload();
// })
