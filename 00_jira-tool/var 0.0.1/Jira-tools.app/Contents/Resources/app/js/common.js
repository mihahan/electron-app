'use strict';

var electron = require('electron'),
    remote = electron.remote,
    shell = electron.shell;

var jiraUtil = remote.require('./js/lib/jiraUtil'),
    request = require('request');

var userData = JSON.parse(localStorage.getItem('userData'));

var dateUtils = require('date-utils');

var date = new Date();


var $ = require('jquery');


function openLink(e) {
  shell.openExternal(e.href);
}
