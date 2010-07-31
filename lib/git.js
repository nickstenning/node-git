if (!(($:.include?(File.dirname("(string)")) or $:.include?(File.expand_path(File.dirname("(string)")))))) {
  $:.unshift(File.dirname("(string)"))
}
require("git/base")
require("git/path")
require("git/lib")
require("git/repository")
require("git/index")
require("git/working_directory")
require("git/log")
require("git/object")
require("git/branches")
require("git/branch")
require("git/remote")
require("git/diff")
require("git/status")
require("git/author")
require("git/stashes")
require("git/stash")
lib = Git.Lib.new(nil, nil)
if (!(lib.meets_required_version?())) {
  $stderr.puts("[WARNING] The git gem requires git #{lib.required_command_version().join(".")} or later, but only found #{lib.current_command_version().join(".")}. You should probably upgrade.")
}
util.namespace('Git');

VERSION = "1.0.4"
this.bare: function (git_dir, options = {  }) {
  Base.bare(git_dir, options)
},
this.open: function (working_dir, options = {  }) {
  Base.open(working_dir, options)
},
this.init: function (working_dir = ".", options = {  }) {
  Base.init(working_dir, options)
},
this.clone: function (repository, name, options = {  }) {
  Base.clone(repository, name, options)
},
this.export: function (repository, name, options = {  }) {
  options.delete(remote)
  repo = clone(repository, name, { depth: 1 }.merge(options))
  if (options[branch]) repo.checkout("origin/#{options[branch]}")
  Dir.chdir(repo.dir().to_s()) { FileUtils.rm_r(".git") }
},
config: function (name = nil, value = nil) {
  lib = Git.Lib.new()
  if ((name && value)) {
    lib.config_set(name, value)
  } else {
    name ? (lib.config_get(name)) : (lib.config_list())
  }
},
this.global_config: function (name = nil, value = nil) {
  lib = Git.Lib.new(nil, nil)
  if ((name && value)) {
    lib.global_config_set(name, value)
  } else {
    name ? (lib.global_config_get(name)) : (lib.global_config_list())
  }
},
global_config: function (name = nil, value = nil) {
  this.class().global_config(name, value)
},

