'use strict';

var electron = require('electron'),
    remote = electron.remote,
    shell = electron.shell;

var jiraUtil = remote.require('./js/lib/jiraUtil'),
    request = require('request');

var userData = JSON.parse(localStorage.getItem('userData'));



var $ = require('jquery');



var _ = require('underscore'),
    Backbone = require('backbone');

Backbone.LocalStorage = require('backbone.localstorage')

var firstPage = 'src/view/view.html';


$(function(){
  if(userData) {
    jiraUtil.get('/rest/api/2/myself', userData, function (err, resp, body) {
      if (body.key) {
        document.location.href = firstPage;
      } else {
        errorView();
        $("#error").show();
      }
    });
  } else {
    errorView();
  }

  var AppView = Backbone.View.extend({
    el: $("#login"),
    events: {
      "click #submit":  "createOnEnter"
    },
    initialize: function() {
      this.username = this.$("#jira-username");
      this.password = this.$("#jira-password");
      if(userData) {
        this.username.val(userData.username);
        this.password.val(userData.password);
      }
    },
    createOnEnter: function(e) {
      if (!this.username.val()) return;
      var jiraDatas = {
        username: this.username.val(),
        password: this.password.val()
      };

      localStorage.setItem('userData', JSON.stringify(jiraDatas));
      userData = JSON.parse(localStorage.getItem('userData'));
      jiraUtil.get('/rest/api/2/user', userData, function (err, resp, body) {
        if (body.key) {
          document.location.href = firstPage;
        } else {
          $("#error").show();
        }
      });

      return false;
    },

  });

  var App = new AppView;

  function errorView() {
    $('#contents-load').hide();
    $('#login_wrap').show();
  }

});
