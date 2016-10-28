// Start BrowserSync server
//
// grunt-browser-sync: <https://github.com/shakyShane/grunt-browser-sync>
// BrowserSync: <http://www.browsersync.io/>
// Options: <http://www.browsersync.io/docs/options/>

'use strict';

module.exports = function (grunt, options) {
  var routes = {};
  routes['/bower_components'] = 'bower_components';
  routes['/' + options.path.styles] = options.path.styles;

  return {
    // Dev server
    app: {
      options: {
        server: {
          baseDir: [
            '<%= path.tmp %>',
            '<%= path.app %>'
          ],
          routes: routes
        },
        ui: {
          port: 9010
        },
        port: 9000,
        notify: false,
        watchTask: true
      },
      src: [
        '<%= path.app %>/**',
        '<%= path.tmp %>/**',
        '!<%= path.distIgnore %>'
      ]
    },

    // Server using dist files
    dist: {
      options: {
        server: {
          baseDir: [
            '<%= path.dist %>'
          ]
        },
        ui: false,
        port: 9001,
        notify: false
      }
    }
  };
};
