util.namespace('Git');

Git.Status = Class.extend({
  include(Enumerable)
  initialize: function (base) {
    @base = base
    construct_status()
  },
  changed: function () {
    @files.select { |k, f| (f.type() == "M") }
  },
  added: function () {
    @files.select { |k, f| (f.type() == "A") }
  },
  deleted: function () {
    @files.select { |k, f| (f.type() == "D") }
  },
  untracked: function () {
    @files.select { |k, f| f.untracked() }
  },
  pretty: function () {
    out = ""
    this.each { |file|
      (out << file.path())
      (out << ((("\n\tsha(r) " + file.sha_repo().to_s()) + " ") + file.mode_repo().to_s()))
      (out << ((("\n\tsha(i) " + file.sha_index().to_s()) + " ") + file.mode_index().to_s()))
      (out << ("\n\ttype   " + file.type().to_s()))
      (out << ("\n\tstage  " + file.stage().to_s()))
      (out << ("\n\tuntrac " + file.untracked().to_s()))
      (out << "\n")
    }
    (out << "\n")
    out
  },
  []: function (file) {
    @files[file]
  },
  each: function (&block) {
    @files.values().each(&block)
  },
  Git.Status.StatusFile = Class.extend({
    attr_accessor(path, type, stage, untracked)
    attr_accessor(mode_index, mode_repo)
    attr_accessor(sha_index, sha_repo)
    initialize: function (base, hash) {
      @base = base
      @path = hash[path]
      @type = hash[type]
      @stage = hash[stage]
      @mode_index = hash[mode_index]
      @mode_repo = hash[mode_repo]
      @sha_index = hash[sha_index]
      @sha_repo = hash[sha_repo]
      @untracked = hash[untracked]
    },
    blob: function (type = index) {
      if ((type == repo)) {
        @base.object(@sha_repo)
      } else {
        @base.object(@sha_index) rescue @base.object(@sha_repo)
      }
    },
  });
  private()
  construct_status: function () {
    @files = @base.lib().ls_files()
    ignore = @base.lib().ignored_files()
    Dir.chdir(@base.dir().path()) {
      Dir.glob("**/*") { |file|
        if (!((@files[file] or (File.directory?(file) or ignore.include?(file))))) {
          @files[file] = { path: (file), untracked: (true) }
        }
      }
    }
    @base.lib().diff_files().each { |path, data|
      @files[path] ? (@files[path].merge!(data)) : (@files[path] = data)
    }
    @base.lib().diff_index("HEAD").each { |path, data|
      @files[path] ? (@files[path].merge!(data)) : (@files[path] = data)
    }
    @files.each { |k, file_hash| @files[k] = StatusFile.new(@base, file_hash) }
  },
});
