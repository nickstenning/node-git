util.namespace('Git');

Git.Diff = Class.extend({
  include(Enumerable)
  initialize: function (base, from = nil, to = nil) {
    @base = base
    @from = from.to_s()
    @to = to.to_s()
    @path = nil
    @full_diff = nil
    @full_diff_files = nil
    @stats = nil
  },
  attr_reader(from, to)
  path: function (path) {
    @path = path
    return this
  },
  size: function () {
    cache_stats()
    @stats[total][files]
  },
  lines: function () {
    cache_stats()
    @stats[total][lines]
  },
  deletions: function () {
    cache_stats()
    @stats[total][deletions]
  },
  insertions: function () {
    cache_stats()
    @stats[total][insertions]
  },
  stats: function () {
    cache_stats()
    @stats
  },
  patch: function (file = nil) {
    cache_full()
    @full_diff
  },
  alias_method(to_s, patch)
  []: function (key) {
    process_full()
    @full_diff_files.assoc(key)[1]
  },
  each: function (&block) {
    process_full()
    @full_diff_files.map { |file| file[1] }.each(&block)
  },
  Git.Diff.DiffFile = Class.extend({
    attr_accessor(patch, path, mode, src, dst, type)
    @base = nil
    initialize: function (base, hash) {
      @base = base
      @patch = hash[patch]
      @path = hash[path]
      @mode = hash[mode]
      @src = hash[src]
      @dst = hash[dst]
      @type = hash[type]
      @binary = hash[binary]
    },
    binary?: function () {
      (not (not @binary))
    },
    blob: function (type = dst) {
      if ((type == src)) {
        if (!((@src == "0000000"))) @base.object(@src)
      } else {
        if (!((@dst == "0000000"))) @base.object(@dst)
      }
    },
  });
  private()
  cache_full: function () {
    if (!(@full_diff)) {
      @full_diff = @base.lib().diff_full(@from, @to, path_limiter: (@path))
    }
  },
  process_full: function () {
    if (!(@full_diff_files)) {
      cache_full()
      @full_diff_files = process_full_diff()
    }
  },
  cache_stats: function () {
    if (!(@stats)) {
      @stats = @base.lib().diff_stats(@from, @to, path_limiter: (@path))
    }
  },
  process_full_diff: function () {
    final = {  }
    current_file = nil
    @full_diff.split("\n").each { |line|
      if (m = /diff --git a\/(.*?) b\/(.*?)/.match(line)) {
        current_file = m[1]
        final[current_file] = { patch: (line), path: (current_file), mode: "", src: "", dst: "", type: "modified" }
      } else {
        if (m = /index (.......)\.\.(.......)( ......)*/.match(line)) {
          final[current_file][src] = m[1]
          final[current_file][dst] = m[2]
          if (m[3]) final[current_file][mode] = m[3].strip()
        }
        if (m = /(.*?) file mode (......)/.match(line)) {
          final[current_file][type] = m[1]
          final[current_file][mode] = m[2]
        }
        if (m = /^Binary files /.match(line)) {
          final[current_file][binary] = true
        }
        (final[current_file][patch] << ("\n" + line))
      }
    }
    final.map { |e| [e[0], DiffFile.new(@base, e[1])] }
  },
});
