_ = require 'lodash'
_B = require 'uberscore'

l = new _B.Logger 'urequire/ModuleGeneratorTemplates'

pathRelative = require('../paths/pathRelative')
Template = require './Template'

{VERSION} = require('../urequire')
#
#  Templates for
# * UMD module based on https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
#
# * AMD module `define([...], function(...){return theModule})
#
# * nodejs module `module.exports = theModule`
#
#  @param @module {Module} with
#   {
#     path: where the module is, within bundle
#
#     name: the name, if it exists.
#
#     kind: type of the original module : 'nodejs' or 'AMD'
#
#     defineArrayDeps: Array of deps, as delcared in AMD, filerelative (eg '../PersonView' for 'views/PersonView') + all `require('dep')`
#
#     nodeDeps: Array for file-relative dependencies, as required by node (eg '../PersonView')
#
#     parameters: Array of parameter names, as declared on the original AMD, minus those exceeding arrayDeps or with added dummy ones if they were less.
#
#     flags:
#
#       rootExports: Array with names 'root' variable(s) to export on the browser side (or false/undefined)
#
#       noConflict: if true, inject a noConflict() method on this module, that reclaims all rootExports to their original value and returns this module.
#
#     factoryBody: The code that returns the module (the body of the function that's the last param of `define()`) or the whole body of the commonjs `require()` module.
#
#     preDefineIFIBody: The code with an IFI, before the `define()` call (i.e coffeescripts __extends etc)
#
#     webRootMap: path of where to map '/' when running on node, relative to bundleRoot (starting with '.'), absolute OS path otherwise.
#  }

class ModuleGeneratorTemplates extends Template

  constructor: (@module)->
  
  Object.defineProperties @::,

    headerBanner: get:-> "// Generated by uRequire v#{VERSION}"

    moduleNamePrint: get:-> if @module.name then "'#{@module.name}', " else ""

    ### Object.defineProperties @::,  parameters of the factory method, eg 'require, _, personModel' ###
    parametersPrint: get:-> """
      require#{if (@module.kind is 'nodejs') then ', exports, module' else ''}#{
      (", #{par}" for par in @module.parameters).join ''}
    """

    defineArrayDepsPrint: get:-> """
      #{
        if _.isEmpty @module.defineArrayDeps
          "" #keep empty [] not existent, enabling requirejs scan
        else
          if @module.kind is 'nodejs'
            "['require', 'exports', 'module'"
          else
            "['require'"
      }#{
        (for dep in @module.defineArrayDeps
           ", #{dep.name(quote:true)}").join('') # quote: single quotes if literal, no quotes otherwise (if untrusted)
      }#{
        if _.isEmpty @module.defineArrayDeps then '' else '], '
      }
      """

    bodyStartBanner: get:-> "// uRequire v#{VERSION}: START body of original #{@module.kind} module"
    bodyEndBanner: get:-> "// uRequire v#{VERSION}: END body of original #{@module.kind} module"

    beforeBody: get: ->
      if @module.beforeBody
        "// uRequire v#{VERSION}: module.beforeBody contents \n #{@module.beforeBody}"
      else ''

    afterBody: get:->
      if @module.afterBody
        "// uRequire v#{VERSION}: module.afterBody contents \n #{@module.afterBody}"
      else ''

    factoryBodyAMD: get:->"""
      #{@beforeBody}
      #{@bodyStartBanner}
      #{@module.factoryBody}
      #{@bodyEndBanner}
      #{@afterBody}
      #{if (@module.kind is 'nodejs')
          '\nreturn module.exports;'
        else ''
       }
    """

    factoryBodyNodejs: get:->"""
      #{@beforeBody}
      #{@bodyStartBanner}
      #{ if @module.kind is 'AMD'
          "module.exports = #{@_functionIFI @module.factoryBody};"
        else
          @module.factoryBody
      }
      #{@bodyEndBanner}
      #{@afterBody}
    """

    preDefineIFIBodyPrint: get:->
      if @module.preDefineIFIBody
        """
          // uRequire v#{VERSION}: START of preDefineIFIBody - statements/declarations before define(), enclosed in an IFI (function(){})().
          #{@module.preDefineIFIBody}
          // uRequire v#{VERSION}: END of preDefineIFIBody\n
        """
      else ''


    runtimeInfoPrint: get: ->
      if @module.bundle.build.runtimeInfo
        @runtimeInfo + '\n'
      else ''

  ### private ###
  _rootExportsNoConflict: (factoryFn, rootName='root')-> """
    var __umodule = #{factoryFn};
    #{
      if @module.flags.noConflict
        ("#{if i is 0 then 'var ' else '    '}old_#{exp} = #{rootName}.#{exp}" for exp, i in @module.flags.rootExports).join(',\n') + ';'
      else ''
    }

    #{("#{rootName}.#{exportedVar} = __umodule" for exportedVar in @module.flags.rootExports).join(';\n') };

    """ + (
      if @module.flags.noConflict
        "__umodule.noConflict = " + @_function("""
              #{("  #{rootName}.#{exp} = old_#{exp}" for exp in @module.flags.rootExports).join(';\n')};
              return __umodule;
            """)
      else
        ''
    ) + "\nreturn __umodule;"


  ###
    UMD template - runs AS-IS on both Web/AMD and nodejs (having 'npm install urequire').
    * Uses `NodeRequirer` to perform `require`s.
  ###
  UMD: ->
    fullBody =
      @runtimeInfoPrint +
      @preDefineIFIBodyPrint + '\n' +
      @_functionIFI("""
         if (typeof exports === 'object') {
            var nr = new (require('urequire').NodeRequirer) ('#{@module.path}', module, __dirname, '#{@module.webRootMap}');
            module.exports = factory(nr.require#{
              if (@module.kind is 'nodejs') then ', exports, module' else ''}#{
              (for nDep in @module.nodeDeps
                if nDep.isSystem
                  ', ' + nDep.name()
                else
                  ", nr.require(#{nDep.name(quote:true)})"
              ).join('')});
          } else if (typeof define === 'function' && define.amd) {
              define(#{@moduleNamePrint}#{@defineArrayDepsPrint}#{
                if (_.isEmpty @module.flags.rootExports) or @module.bundle?.noRootExports
                  'factory'
                else
                  @_function(
                    @_rootExportsNoConflict("factory(#{@parametersPrint})"),
                    @parametersPrint
                  )
                });
          }
        """,
        # parameters + values to our IFI
        'root', 'this',
        'factory', @_function(@factoryBodyAMD, @parametersPrint)
      )

    @headerBanner + " - template: 'UMD'\n" +
      (if @module.bundle.build.bare then fullBody else @_functionIFI fullBody) + ';'


  ### AMD template
      Simple `define(['dep'], function(dep){...body...}})`
      Runs only on WEB/AMD/RequireJs (and hopefully soon in node through uRequire'd *driven* RequireJS).
  ###
  AMD: ->
    fullBody =
      @runtimeInfoPrint +
      @preDefineIFIBodyPrint +
      @_AMD_plain_define()

    @headerBanner + " - template: 'AMD'\n" +
      (if @module.bundle.build.bare then fullBody else @_functionIFI fullBody) + ';'

  # not adding @preDefineIFIBodyPrint, they are added by whoever uses this.
  # 'combined' template merges them and add them once on combined enclosing function
  _AMD_plain_define: -> """
    define(#{@moduleNamePrint}#{@defineArrayDepsPrint}
      #{
        #our factory function
        @_function(
          # factory Body
          if (_.isEmpty @module.flags.rootExports) or @module.bundle?.noRootExports # 'standard' AMD format
            @factoryBodyAMD
          else # ammend to export window = @module.flags.rootExports
            @_rootExportsNoConflict(
              @_functionIFI(@factoryBodyAMD, @parametersPrint, @parametersPrint),
              'window'# rootName
            )
          ,
          # our factory function declaration params
          @parametersPrint)
      }
    );
  """

  combined: -> @_AMD_plain_define()

  nodejs: ->
    paramPrintCount = 0

    fullBody = """
      #{@preDefineIFIBodyPrint}
      #{
        if _.any(@module.nodeDeps, (dep)->not dep.isSystem) then "\nvar " else ''}#{
        (for param, pi in @module.parameters when not (dep = @module.nodeDeps[pi]).isSystem
            "#{if paramPrintCount++ is 0 then '' else '    '}#{
            param} = require(#{dep.name(quote:true)})"
        ).join(',\n')
      };
      #{@runtimeInfoPrint}
      #{@factoryBodyNodejs}
    """

    @headerBanner + " - template: 'nodejs'" +
      (if @module.bundle.build.bare isnt false then fullBody else @_functionIFI fullBody) + ';'

module.exports = ModuleGeneratorTemplates