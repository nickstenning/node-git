util.namespace('Git');

Git.Remote = Path.extend({
  attr_accessor(name, url, fetch_opts)
  initialize: function (base, name) {
    @base = base
    config = @base.lib().config_remote(name)
    @name = name
    @url = config["url"]
    @fetch_opts = config["fetch"]
  },
  remove: function () {
    @base.remote_remove(@name)
  },
  fetch: function () {
    @base.fetch(@name)
  },
  merge: function (branch = "master") {
    @base.merge("#{@name}/#{branch}")
  },
  branch: function (branch = "master") {
    Git.Branch.new(@base, "#{@name}/#{branch}")
  },
  remove: function () {
    @base.lib().remote_remove(@name)
  },
  to_s: function () {
    @name
  },
});
