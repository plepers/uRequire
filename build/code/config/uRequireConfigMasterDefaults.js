// Generated by CoffeeScript 1.6.3
var l, uRequireConfigMasterDefaults, _, _B;

_ = require('lodash');

_B = require('uberscore');

l = new _B.Logger('urequire/uRequireConfigMasterDefaults');

module.exports = uRequireConfigMasterDefaults = {
  /*
  
  All bundle related information is nested in the keys bellow
  
  Note: user configs (especially simple ones) can safelly ommit 'bundle' hash (as well as 'build' below)
  and put keys belonging ot it directly on the 'root' of their object.
  */

  bundle: {
    /*
    Name of the bundle, eg 'MyLibrary'
    
    @optional
    
    `name` its self can be derived from:
      - if using grunt, it defaults to the multi-task @target (eg {urequire: 'MyBundlename': {bundle : {}, build:{} }}
    
      @todo:
      - --dstPath,
        - filename part, if 'combined' is used eg if its 'abcProject/abc.js', then 'abc'
        - folder name, if other template is used eg 'build/abcProject' gives 'abcProject'
    
    @note: `name` & is the (1st) default for 'main'
    */

    name: void 0,
    /*
    The "main" / "index" module file of your bundle, used only when 'combined' template is used.
    
    @optional
    
    * Used as 'name' / 'include' on RequireJS build.js.
      It should be the 'entry' point module of your bundle, where all dependencies are `require`'d.
      r.js recursivelly adds them to the 'combined' optimized file.
    
    * It is also used to as the initiation `require` on your combined bundle.
      It is the module just kicks off the app and/or requires all your other library modules.
    
    * Defaults to 'name', 'index', 'main' etc, the first one that is found in uModules.
    */

    main: void 0,
    path: void 0,
    filez: ['**/*.*'],
    copy: [],
    resources: [
      {
        name: '*Javascript',
        filez: ['**/*.js', /.*\.(javascript)$/i],
        convert: function(source, filename) {
          return source;
        },
        dstFilename: function(filename) {
          return (require('../paths/upath')).changeExt(filename, 'js');
        }
      }, [
        '*coffee-script', ['**/*.coffee', /.*\.(coffee\.md|litcoffee)$/i], function(source, srcFilename) {
          return (require('coffee-script')).compile(source, {
            bare: true
          });
        }, function(srcFilename) {
          var ext;
          ext = srcFilename.replace(/.*\.(coffee\.md|litcoffee|coffee)$/, "$1");
          return srcFilename.replace(new RegExp(ext + '$'), 'js');
        }
      ], [
        '*LiveScript', ['**/*.ls'], function(source) {
          return (require('LiveScript')).compile(source, {
            bare: true
          });
        }, function(srcFilename) {
          return srcFilename.replace(/(.*)\.ls$/, '$1.js');
        }
      ]
    ],
    /*
    Where to map `/` when running in node. On RequireJS its http-server's root.
    
    Can be absolute or relative to bundle. Defaults to bundle.
    @example "/var/www" or "/../../fakeWebRoot"
    */

    webRootMap: '.',
    dependencies: {
      /*
      Each (global) dependency has one or more variables it is exported as, eg `jquery: ["$", "jQuery"]`
      
      They can be infered from the code of course (AMD only for now), but it good to list them here also.
      
      They are used to 'fetch' the global var at runtime, eg, when `combined:'almond'` is used.
      
      In case they are missing from modules (i.e u use the 'nodejs' module format only),
      and aren't here either, 'almond' build will fail.
      
      Also you can add a different var name that should be globally looked up.
      */

      depsVars: {},
      _knownDepsVars: {
        chai: 'chai',
        mocha: 'mocha',
        lodash: "_",
        underscore: "_",
        jquery: ["$", "jQuery"],
        backbone: "Backbone",
        knockout: ["ko", 'Knockout']
      },
      exports: {
        /*
        { dependency: varName(s) *}
            or
        ['dep1', 'dep2'] (with discovered or ../depsVars names)
        
        Each dep will be available in the *whole bundle* under varName(s) - they are global to your bundle.
        
        @example {
          'underscore': '_'
          'jquery': ["$", "jQuery"]
          'models/PersonModel': ['persons', 'personsModel']
        }
        */

        bundle: {},
        /*
        Each dep listed will be available GLOBALY under varName(s) - @note: works in browser only - attaching to `window`.
        
        @example {
          'models/PersonModel': ['persons', 'personsModel']
        }
        
            is like having a `{rootExports: ['persons', 'personsModel']} in 'models/PersonModel' module.
        @todo: NOT IMPLEMENTED - use module `{rootExports: [...]} format.
        */

        root: {}
      },
      /*
        Replace all right hand side dependencies (String value or []<String> values), to the left side (key)
        Eg `lodash: ['underscore']` replaces all "underscore" deps to "lodash" in the build files.
      */

      replaceTo: {
        lodash: ['underscore']
      }
    }
  },
  /*
  
    Build : Defines the conversion, such as *where* and *what* to output
  */

  build: {
    /*
    Output converted files onto this
    
    * directory
    * filename (if combining)
    * function @todo: NOT IMPLEMENTED
    
    #todo: if ommited, requirejs.buildjs.baseUrl is used ?
    @example 'build/code'
    */

    dstPath: void 0,
    /*
    Output on the same directory as path.
    
    Useful if your sources are not `real sources` eg. you use coffeescript :-).
    WARNING: -f ignores --dstPath
    */

    forceOverwriteSources: false,
    /*
      String in ['UMD', 'AMD', 'nodejs', 'combined'] @todo: or an object with those as keys + more stuff!
    */

    template: {
      name: 'UMD'
    },
    watch: false,
    /*
      When true, it ignores all rootExports {& noConflict()} defined in all module files eg
        `{rootExports: ['persons', 'personsModel']}`
    
      'true' doens not ignore those of `dependencies: exports: root`, @todo: when `exports.root` is implemented :-
      * use 'bundle' to ignore those defined in `bundle.exports.root` config @todo: NOT IMPLEMENTED
      * use 'all' to ignore all root exports @todo: NOT IMPLEMENTED
    */

    noRootExports: false,
    /*
    *Web/AMD side only option* :
    
    By default, ALL require('') deps appear on []. to prevent RequireJS to scan @ runtime.
    
    With --s you can allow `require('')` scan @ runtime, for source modules that have no [] deps (i.e. nodejs source modules).
    NOTE: modules with rootExports / noConflict() always have `scanAllow: false`
    */

    scanAllow: false,
    /*
    Pre-require all deps on node, even if they arent mapped to parameters, just like in AMD deps [].
    Preserves same loading order, but a possible slower starting up. They are cached nevertheless, so you might gain speed later.
    */

    allNodeRequires: false,
    verbose: false,
    debugLevel: 0,
    "continue": false,
    optimize: false,
    _optimizers: ['uglify2', 'uglify']
  },
  /*
    Other draft/ideas
    - modules to exclude their need from either AMD/UMD or combine and allow them to be either
      - accessed through global object, eg 'window'
      - loaded through RequireJs/AMD if it available
      - Loaded through nodejs require()
      - other ?
    With some smart code tranformation they can be turned into promises :-)
  */

  /*
  Runtime settings - these are used only when executing on nodejs.
  They are written out as a "uRequire.config.js" module used at runtime on the nodejs side.
  @todo: NOT IMPLEMENTED
  */

  requirejs: {
    paths: {
      src: "../../src",
      text: "requirejs_plugins/text",
      json: "requirejs_plugins/json"
    },
    baseUrl: "../code"
  },
  "build.js": {
    /*
    piggy back on this? see `appDir` in https://github.com/jrburke/r.js/blob/master/build/example.build.js
    @todo: NOT IMPLEMENTED -
    */

    appDir: "some/path/",
    paths: {
      lodash: "../../libs/lodash.min"
    }
  }
};