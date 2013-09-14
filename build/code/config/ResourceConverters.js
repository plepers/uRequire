// Generated by CoffeeScript 1.6.3
var defaultResourceConverters, extraResourceConverters;

defaultResourceConverters = [
  {
    name: '$javascript',
    descr: "Dummy js converter, does nothing much but marking `.js` files as `Module`s.",
    filez: ['**/*.js', /.*\.(javascript)$/],
    convert: function(r) {
      return r.source;
    },
    convFilename: function(srcFilename) {
      return (require('../paths/upath')).changeExt(srcFilename, 'js');
    },
    type: 'module',
    isAfterTemplate: false,
    isTerminal: false,
    isMatchSrcFilename: false
  }, [
    '$coffee-script', "Coffeescript compiler, using the locally installed 'coffee-script' npm package. Uses `bare:true`.", ['**/*.coffee', /.*\.(coffee\.md|litcoffee)$/i], function(r) {
      var coffee;
      coffee = require('coffee-script');
      return coffee.compile(r.source);
    }, function(srcFn) {
      var coffeeExtensions, ext;
      coffeeExtensions = /.*\.(coffee\.md|litcoffee|coffee)$/;
      ext = srcFn.replace(coffeeExtensions, "$1");
      return srcFn.replace(new RegExp(ext + '$'), 'js');
    }
  ], [
    '$LiveScript', ['**/*.ls'], function(r) {
      return (require('LiveScript')).compile(r.source);
    }, '.js'
  ], [
    '$iced-coffee-script', ['**/*.iced'], (function(r) {
      return require('iced-coffee-script').compile(r.source);
    }), '.js'
  ], [
    '$coco', ['**/*.co'], (function(r) {
      return require('coco').compile(r.source);
    }), '.js'
  ]
];

extraResourceConverters = {
  teacup: [
    '@~teacup', "Renders teacup as nodejs modules (exporting the template function or a `renderable`), to HTML.\nFileResource means the file's source is not read/refreshed.", ['**/*.teacup'], (function() {
      require.extensions['.teacup'] = require.extensions['.coffee'];
      return function(r) {
        var template;
        template = r.requireUncached(r.srcRealpath);
        return (require('teacup')).render(template);
      };
    })(), '.html'
  ]
};

module.exports = {
  defaultResourceConverters: defaultResourceConverters,
  extraResourceConverters: extraResourceConverters
};
