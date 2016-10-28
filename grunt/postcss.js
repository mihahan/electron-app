// Parse CSS and add vendor prefixes
//
// grunt-postcss: <https://github.com/nDmitry/grunt-postcss>
// Autoprefixer: <https://github.com/postcss/autoprefixer>

'use strict';

var autoprefixer = require('autoprefixer');

module.exports = {
  options: {
    map: {
      inline: false
    },
    processors: [
      autoprefixer({
        // Targeting notation: <https://github.com/ai/browserslist#queries>
        browsers: [
          'last 2 versions',
          'Explorer >= 8',
          'Firefox ESR',
          'Android >= 4',
          'iOS >= 7'
        ]
      })
    ]
  },

  compile: {
    files: [{
      expand: true,
      cwd: '<%= path.css %>',
      dest: '<%= path.css %>',
      src: '**/*.css'
    }]
  }
};
