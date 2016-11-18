'use strict';

module.exports.getCachedElement = function getCachedElement(id) {
  return getCachedElement.cahce = getCachedElement.cache || document.getElementById(id);
};
