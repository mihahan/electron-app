// Copy files and folders
//
// grunt-contrib-copy: <https://github.com/gruntjs/grunt-contrib-copy>

'use strict';

module.exports = {
  dist: {
    files: [
      // Static files
      {
        expand: true,
        dot: true,
        cwd: '<%= path.app %>',
        dest: '<%= path.dist %>',
        filter: 'isFile',   // Ignore empty folders.
        src: [
          '**',
          '!<%= path.distIgnore %>',
          '!**/.DS_Store',
          '!**/*.{css,js}'  // Ignore CSS and JavaScript because they are compiled in usemin task.
        ]
      },
      // Precompiled files
      {
        expand: true,
        cwd: '<%= path.tmp %>',
        dest: '<%= path.dist %>',
        src: [
          'img/*.png',
          '!<%= path.distIgnore %>'
        ]
      }
    ]
  }
};
