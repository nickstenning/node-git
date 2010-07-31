util.namespace('Git');

Git.Path = Class.extend({
  attr_accessor(path)
  initialize: function (path, check_path = true) {
    if (((not check_path) or File.exists?(path))) {
      @path = File.expand_path(path)
    } else {
      raise(ArgumentError, "path does not exist", File.expand_path(path))
    }
  },
  readable?: function () {
    File.readable?(@path)
  },
  writable?: function () {
    File.writable?(@path)
  },
  to_s: function () {
    @path
  },
});
