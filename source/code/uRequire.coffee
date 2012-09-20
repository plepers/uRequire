###
  processes each .js file in 'bundlePath', extracting AMD/module information
  It then tranforms each file using template to 'outputPath'
###

processBundle = (options)->
  l = require('./utils/logger')
  if not options.verbose then l.verbose = ->

  l.verbose 'uRequire called with options\n', options

  _ = require 'lodash'
  _fs = require 'fs'
  _path = require 'path'
  _wrench = require 'wrench'
  getFiles = require "./utils/getFiles"
  template = require "./templates/UMD"
  extractModuleInfo = require "./extractModuleInfo"
  resolveDependencies = require './resolveDependencies'
  resolveWebRoot = require './resolveWebRoot'
  DependencyReporter = require './DependencyReporter'

  interestingDependencyTypes = ['notFoundInBundle', 'wrongDependencies']
  reporter = new DependencyReporter(if options.verbose then null else interestingDependencyTypes )

  bundleFiles =  getFiles options.bundlePath, (fileName)->
    (_path.extname fileName) is '.js' #todo: make sure its an AMD module

  l.verbose 'Bundle files found: \n', bundleFiles

  for modyle in bundleFiles
    l.verbose 'Processing module: ', modyle

    oldJs = _fs.readFileSync(options.bundlePath + '/' + modyle, 'utf-8')
    moduleInfo = extractModuleInfo oldJs, {beautifyFactory:true, extractRequires:true}

    if _.isEmpty moduleInfo
      l.warn "Not AMD module '#{modyle}', copying as-is."
      newJs = oldJs
    else # we have a module

      # In the UMD template 'require' is *fixed*, so remove it
      for pd in [moduleInfo.parameters, moduleInfo.dependencies]
        pd.shift() if pd[0] is 'require'

      resDeps = resolveDependencies modyle, bundleFiles, moduleInfo.dependencies
      resReqDeps = resolveDependencies modyle, bundleFiles, moduleInfo.requireDependencies

      #some reporting
      for repData in [resDeps, resReqDeps, (_.pick moduleInfo, 'wrongDependencies')]
        reporter.addReportData repData, modyle

      UMDdependencies = resDeps.bundleRelative
      # add require('..') , if they dont exist
      for reqDep in _.difference(resReqDeps.bundleRelative, UMDdependencies)
        UMDdependencies.push reqDep

      templateInfo = #
        version: options.version
        modulePath: _path.dirname modyle # module path within bundle
        webRoot: resolveWebRoot modyle, options.webRootMap
        UMDdependencies: UMDdependencies
        nodeDependencies: resDeps.fileRelative
        parameters: moduleInfo.parameters
        rootExports: if options.noExports then false else moduleInfo.rootExports
        factoryBody: moduleInfo.factoryBody

      l.verbose 'Main template params:\n', _.omit templateInfo, 'version', 'modulePath', 'type', 'factoryBody'

      newJs = template templateInfo

    outputFile = _path.join options.outputPath, modyle

    if not (_fs.existsSync _path.dirname(outputFile))
      l.verbose "creating directory #{_path.dirname(outputFile)}"
      _wrench.mkdirSyncRecursive(_path.dirname(outputFile))

    _fs.writeFileSync outputFile, newJs, 'utf-8'

  if not _.isEmpty(reporter.reportData)
    l.log '########### uRequire, final report ########### :\n', reporter.getReport()

  return null # save pointless coffeescript return :-)

module.exports =
  processBundle: processBundle

  # used by UMD-transformed modules, to make the node (async) require
  makeNodeRequire: require('./makeNodeRequire')
