require.paths.unshift(__dirname + '/../lib')

var fs      = require('fs'),
    assert  = require('assert'),
    exec    = require('child_process').exec,
    inspect = require('eyes').inspector()

// This is a file designed to be loaded by each test, which
// takes care of loading vows, assert, and any other libraries
// needed by the tests.
//
// It places any properties in the "namespace" object below into
// the global namespace of the tests.

var extend = function(obj, props) {
  Object.getOwnPropertyNames(props).forEach(function(prop){
    var descriptor = Object.getOwnPropertyDescriptor(props, prop)
    descriptor.enumerable = false
    Object.defineProperty(obj, prop, descriptor)
  })
}

extend(Object, {
  merge: function (a, b) {
    if (!b) return a
    var keys = Object.keys(b)
    for (var i = 0, len = keys.length; i < len; ++i)
      a[keys[i]] = b[keys[i]]
    return a
  }
})

// Additional assertions

assert.isFile = function isFile(fname, message) {
  try {
    stat = fs.statSync(fname)
  } catch(e) {}
  if (!stat || !stat.isFile()) assert.fail(undefined, fname, message, "is not a file", assert.isFile)
}

// Other utility functions

function uid () {
  var uid = ''
  for (var n = 4; n; --n) {
    uid += (Math.abs((Math.random() * 0xFFFFFFF) | 0)).toString(16)
  }
  return uid
}

function tempfile (name) {
  return process.env.TMPDIR + (name || 'tempfile') + '-' + uid()
}

// node-git helpers

var node_git = {
  file_paths: { test_dir: __dirname
              , wdir_dot: __dirname + '/files/working'
              , wbare:    __dirname + '/files/working.git'
              , index:    __dirname + '/files/index'
              },

  create_temp_repo: function create_temp_repo (clone_path, callback) {
    tmp_path = tempfile('git_test')
    fs.mkdirSync(tmp_path, 0755)
    exec('cp -r ' + clone_path + ' ' + tmp_path, function () {
      exec('mv ' + tmp_path + '/working/dot_git ' + tmp_path + '/working/.git', function () {
        callback(tmp_path + '/working')
        exec('rm -r ' + tmp_path)
      })
    })
  },

  in_temp_dir: function (fun, remove_after) {
    remove_after = typeof remove_after === 'undefined' ? true : remove_after
    old_wd = process.cwd()

    tmp_path = tempfile('git_test')
    fs.mkdirSync(tmp_path, 0755)
    process.chdir(tmp_path)
    fun(tmp_path)
    process.chdir(old_wd)

    if (remove_after) exec('rm -r '+ tmp_path)
  },

  get_wdir: function (callback) {
    node_git.create_temp_repo(node_git.file_paths.wdir_dot, function (path) {
      callback(path)
    })
  },

  new_file: function (name, contents) {
    fs.writeFileSync(name, contents)
  },

  append_file: function (name, contents) {
    fs.writeFileSync(name, fs.readFileSync(name) + contents)
  }
}

var namespace = { assert:   assert
                , exec:     exec
                , inspect:  inspect
                , node_git: node_git
                , sys:      require('sys')
                , tempfile: tempfile
                , vows:     require('vows')
                }

Object.merge(global, namespace)
