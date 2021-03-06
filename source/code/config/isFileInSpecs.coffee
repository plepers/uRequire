_ = (_B = require 'uberscore')._

minimatch = require 'minimatch'

# Returns true if `filename` passes through the `filez` specs Array
# 
# @param String filename name of the filename, eg 'myfile.txt' 
#
# @param Array<String|RegExp|Function> filename *specs* in minimatch or RegExp or Function (returning true for match),
#        with negative being '!' either as a 1st char of Strings or
#        as a plain '!' that negates the *spec* following (usefull to exclude matching RegExps & Functions).
#
# @todo: refactor to use a real agreement / _B.Blender
# @todo: move to glob-expand
isFileInSpecs = module.exports = (filename, filez)-> #todo: (3 6 4) convert to proper In/in agreement
  finalAgree = false
  for agreement, idx in _B.arrayize filez #go through all (no bailout when true) cause we have '!*glob*'
    agrees =
      if _.isString agreement
        if agreement[0] is '!'
          if agreement is '!'
            excludeIdx = idx + 1
          else
            excludeIdx = idx
          minimatch filename, agreement.slice(1)
        else
          minimatch filename, agreement

      else
        if _.isRegExp agreement
          !!filename.match agreement
        else
          if _.isFunction agreement
            agreement filename

    if _B.isTrue agrees
      if idx is excludeIdx
        finalAgree = false
      else
        finalAgree = true

  finalAgree
