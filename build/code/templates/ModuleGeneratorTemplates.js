// Generated by CoffeeScript 1.6.3
var ModuleGeneratorTemplates, Template, VERSION, l, pathRelative, _, _B,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require('lodash');

_B = require('uberscore');

l = new _B.Logger('urequire/ModuleGeneratorTemplates');

pathRelative = require('../paths/pathRelative');

Template = require('./Template');

VERSION = require('../urequire').VERSION;

ModuleGeneratorTemplates = (function(_super) {
  __extends(ModuleGeneratorTemplates, _super);

  function ModuleGeneratorTemplates(module) {
    this.module = module;
  }

  Object.defineProperties(ModuleGeneratorTemplates.prototype, {
    headerBanner: {
      get: function() {
        return "// Generated by uRequire v" + VERSION;
      }
    },
    moduleNamePrint: {
      get: function() {
        if (this.module.name) {
          return "'" + this.module.name + "', ";
        } else {
          return "";
        }
      }
    },
    /* Object.defineProperties @::,  parameters of the factory method, eg 'require, _, personModel'*/

    parametersPrint: {
      get: function() {
        var par;
        return "require" + (this.module.kind === 'nodejs' ? ', exports, module' : '') + (((function() {
          var _i, _len, _ref, _results;
          _ref = this.module.parameters;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            par = _ref[_i];
            _results.push(", " + par);
          }
          return _results;
        }).call(this)).join(''));
      }
    },
    defineArrayDepsPrint: {
      get: function() {
        var dep;
        return "" + (_.isEmpty(this.module.defineArrayDeps) ? "" : this.module.kind === 'nodejs' ? "['require', 'exports', 'module'" : "['require'") + (((function() {
          var _i, _len, _ref, _results;
          _ref = this.module.defineArrayDeps;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            dep = _ref[_i];
            _results.push(", " + (dep.name({
              quote: true
            })));
          }
          return _results;
        }).call(this)).join('')) + (_.isEmpty(this.module.defineArrayDeps) ? '' : '], ');
      }
    },
    bodyStartBanner: {
      get: function() {
        return "// uRequire v" + VERSION + ": START body of original " + this.module.kind + " module";
      }
    },
    bodyEndBanner: {
      get: function() {
        return "// uRequire v" + VERSION + ": END body of original " + this.module.kind + " module";
      }
    },
    beforeBody: {
      get: function() {
        if (this.module.beforeBody) {
          return "// uRequire v" + VERSION + ": module.beforeBody contents \n " + this.module.beforeBody;
        } else {
          return '';
        }
      }
    },
    afterBody: {
      get: function() {
        if (this.module.afterBody) {
          return "// uRequire v" + VERSION + ": module.afterBody contents \n " + this.module.afterBody;
        } else {
          return '';
        }
      }
    },
    factoryBodyAMD: {
      get: function() {
        return "" + this.beforeBody + "\n" + this.bodyStartBanner + "\n" + this.module.factoryBody + "\n" + this.bodyEndBanner + "\n" + this.afterBody + "\n" + (this.module.kind === 'nodejs' ? '\nreturn module.exports;' : '');
      }
    },
    factoryBodyNodejs: {
      get: function() {
        return "" + this.beforeBody + "\n" + this.bodyStartBanner + "\n" + (this.module.kind === 'AMD' ? "module.exports = " + (this._functionIFI(this.module.factoryBody)) + ";" : this.module.factoryBody) + "\n" + this.bodyEndBanner + "\n" + this.afterBody;
      }
    },
    preDefineIFIBodyPrint: {
      get: function() {
        if (this.module.preDefineIFIBody) {
          return "// uRequire v" + VERSION + ": START of preDefineIFIBody - statements/declarations before define(), enclosed in an IFI (function(){})().\n" + this.module.preDefineIFIBody + "\n// uRequire v" + VERSION + ": END of preDefineIFIBody\n";
        } else {
          return '';
        }
      }
    }
  });

  /* private*/


  ModuleGeneratorTemplates.prototype._rootExportsNoConflict = function(factoryFn, rootName) {
    var exp, exportedVar, i;
    if (rootName == null) {
      rootName = 'root';
    }
    return ("var __umodule = " + factoryFn + ";\n" + (this.module.flags.noConflict ? ((function() {
      var _i, _len, _ref, _results;
      _ref = this.module.flags.rootExports;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        exp = _ref[i];
        _results.push("" + (i === 0 ? 'var ' : '    ') + "old_" + exp + " = " + rootName + "." + exp);
      }
      return _results;
    }).call(this)).join(',\n') + ';' : '') + "\n\n" + (((function() {
      var _i, _len, _ref, _results;
      _ref = this.module.flags.rootExports;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        exportedVar = _ref[_i];
        _results.push("" + rootName + "." + exportedVar + " = __umodule");
      }
      return _results;
    }).call(this)).join(';\n')) + ";\n") + (this.module.flags.noConflict ? "__umodule.noConflict = " + this._function("" + (((function() {
      var _i, _len, _ref, _results;
      _ref = this.module.flags.rootExports;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        exp = _ref[_i];
        _results.push("  " + rootName + "." + exp + " = old_" + exp);
      }
      return _results;
    }).call(this)).join(';\n')) + ";\nreturn __umodule;") : '') + "\nreturn __umodule;";
  };

  /*
    UMD template - runs AS-IS on both Web/AMD and nodejs (having 'npm install urequire').
    * Uses `NodeRequirer` to perform `require`s.
  */


  ModuleGeneratorTemplates.prototype.UMD = function() {
    var nDep, _ref;
    return this.headerBanner + " - template: 'UMD'\n" + this._functionIFI(this.runTimeDiscovery + '\n' + this.preDefineIFIBodyPrint + '\n' + this._functionIFI("if (typeof exports === 'object') {\n   var nr = new (require('urequire').NodeRequirer) ('" + this.module.path + "', module, __dirname, '" + this.module.webRootMap + "');\n   module.exports = factory(nr.require" + (this.module.kind === 'nodejs' ? ', exports, module' : '') + (((function() {
      var _i, _len, _ref, _results;
      _ref = this.module.nodeDeps;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        nDep = _ref[_i];
        if (nDep.isSystem) {
          _results.push(', ' + nDep.name());
        } else {
          _results.push(", nr.require(" + (nDep.name({
            quote: true
          })) + ")");
        }
      }
      return _results;
    }).call(this)).join('')) + ");\n } else if (typeof define === 'function' && define.amd) {\n     define(" + this.moduleNamePrint + this.defineArrayDepsPrint + ((_.isEmpty(this.module.flags.rootExports)) || ((_ref = this.module.bundle) != null ? _ref.noRootExports : void 0) ? 'factory' : this._function(this._rootExportsNoConflict("factory(" + this.parametersPrint + ")"), this.parametersPrint)) + ");\n }", 'root', 'this', 'factory', this._function(this.factoryBodyAMD, this.parametersPrint))) + ';';
  };

  /* AMD template
      Simple `define(['dep'], function(dep){...body...}})`
      Runs only on WEB/AMD/RequireJs (and hopefully soon in node through uRequire'd *driven* RequireJS).
  */


  ModuleGeneratorTemplates.prototype.AMD = function() {
    return this.headerBanner + " - template: 'AMD'\n" + this._functionIFI(this.runTimeDiscovery + this.preDefineIFIBodyPrint + this._AMD_plain_define()) + ';';
  };

  ModuleGeneratorTemplates.prototype._AMD_plain_define = function() {
    var _ref;
    return "define(" + this.moduleNamePrint + this.defineArrayDepsPrint + "\n  " + (this._function((_.isEmpty(this.module.flags.rootExports)) || ((_ref = this.module.bundle) != null ? _ref.noRootExports : void 0) ? this.factoryBodyAMD : this._rootExportsNoConflict(this._functionIFI(this.factoryBodyAMD, this.parametersPrint, this.parametersPrint), 'window'), this.parametersPrint)) + "\n);";
  };

  ModuleGeneratorTemplates.prototype.combined = function() {
    return this._AMD_plain_define();
  };

  ModuleGeneratorTemplates.prototype.nodejs = function() {
    var dep, param, paramPrintCount, pi;
    paramPrintCount = 0;
    return "" + this.headerBanner + " - template: 'nodejs'\n" + this.preDefineIFIBodyPrint + "\n" + (_.any(this.module.nodeDeps, function(dep) {
      return !dep.isSystem;
    }) ? "\nvar " : '') + (((function() {
      var _i, _len, _ref, _results;
      _ref = this.module.parameters;
      _results = [];
      for (pi = _i = 0, _len = _ref.length; _i < _len; pi = ++_i) {
        param = _ref[pi];
        if (!(dep = this.module.nodeDeps[pi]).isSystem) {
          _results.push("" + (paramPrintCount++ === 0 ? '' : '    ') + param + " = require(" + (dep.name({
            quote: true
          })) + ")");
        }
      }
      return _results;
    }).call(this)).join(',\n')) + ";\n" + this.runTimeDiscovery + "\n" + this.factoryBodyNodejs;
  };

  return ModuleGeneratorTemplates;

})(Template);

module.exports = ModuleGeneratorTemplates;
