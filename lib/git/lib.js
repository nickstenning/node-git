require("tempfile")
util.namespace('Git');

Git.GitExecuteError = StandardError.extend({
});
Git.Lib = Class.extend({
  initialize: function (base = nil, logger = nil) {
    @git_dir = nil
    @git_index_file = nil
    @git_work_dir = nil
    @path = nil
    if (base.is_a?(Git.Base)) {
      @git_dir = base.repo().path()
      if (base.index()) @git_index_file = base.index().path()
      if (base.dir()) @git_work_dir = base.dir().path()
    } else {
      if (base.is_a?(Hash)) {
        @git_dir = base[repository]
        @git_index_file = base[index]
        @git_work_dir = base[working_directory]
      }
    }
    @logger = logger
  },
  init: function () {
    command("init")
  },
  clone: function (repository, name, opts = {  }) {
    @path = (opts[path] or ".")
    clone_dir = opts[path] ? (File.join(@path, name)) : (name)
    arr_opts = []
    if (opts[bare]) (arr_opts << "--bare")
    if (opts[remote]) ((arr_opts << "-o") << opts[remote])
    if ((opts[depth] && (opts[depth].to_i() > 0))) {
      ((arr_opts << "--depth") << opts[depth].to_i())
    }
    (arr_opts << "--")
    (arr_opts << repository)
    (arr_opts << clone_dir)
    command("clone", arr_opts)
    if (opts[bare]) {
      { repository: (clone_dir) }
    } else {
      { working_directory: (clone_dir) }
    }
  },
  log_commits: function (opts = {  }) {
    arr_opts = ["--pretty=oneline"]
    if (opts[count]) (arr_opts << "-#{opts[count]}")
    if (opts[since].is_a?(String)) (arr_opts << "--since=#{opts[since]}")
    if (opts[until].is_a?(String)) (arr_opts << "--until=#{opts[until]}")
    if (opts[grep].is_a?(String)) (arr_opts << "--grep=#{opts[grep]}")
    if (opts[author].is_a?(String)) (arr_opts << "--author=#{opts[author]}")
    if ((opts[between] && (opts[between].size() == 2))) {
      (arr_opts << "#{opts[between][0].to_s()}..#{opts[between][1].to_s()}")
    }
    if (opts[object].is_a?(String)) (arr_opts << opts[object])
    if (opts[path_limiter].is_a?(String)) {
      ((arr_opts << "--") << opts[path_limiter])
    }
    command_lines("log", arr_opts, true).map { |l| l.split().first() }
  },
  full_log_commits: function (opts = {  }) {
    arr_opts = ["--pretty=raw"]
    if (opts[count]) (arr_opts << "-#{opts[count]}")
    if (opts[skip]) (arr_opts << "--skip=#{opts[skip]}")
    if (opts[since].is_a?(String)) (arr_opts << "--since=#{opts[since]}")
    if (opts[until].is_a?(String)) (arr_opts << "--until=#{opts[until]}")
    if (opts[grep].is_a?(String)) (arr_opts << "--grep=#{opts[grep]}")
    if (opts[author].is_a?(String)) (arr_opts << "--author=#{opts[author]}")
    if ((opts[between] && (opts[between].size() == 2))) {
      (arr_opts << "#{opts[between][0].to_s()}..#{opts[between][1].to_s()}")
    }
    if (opts[object].is_a?(String)) (arr_opts << opts[object])
    if (opts[path_limiter].is_a?(String)) {
      ((arr_opts << "--") << opts[path_limiter])
    }
    full_log = command_lines("log", arr_opts, true)
    process_commit_data(full_log)
  },
  revparse: function (string) {
    if (string =~ /[A-Fa-f0-9]{40}/) return string
    rev = ["head", "remotes", "tags"].map { |d|
      File.join(@git_dir, "refs", d, string)
    }.find { |path|
      File.file?(path)
    }
    if (rev) return File.read(rev).chomp()
    command("rev-parse", string)
  },
  namerev: function (string) {
    command("name-rev", string).split()[1]
  },
  object_type: function (sha) {
    command("cat-file", ["-t", sha])
  },
  object_size: function (sha) {
    command("cat-file", ["-s", sha]).to_i()
  },
  commit_data: function (sha) {
    sha = sha.to_s()
    cdata = command_lines("cat-file", ["commit", sha])
    process_commit_data(cdata, sha, 0)
  },
  process_commit_data: function (data, sha = nil, indent = 4) {
    in_message = false
    if (sha) {
      hsh = { "sha": (sha), "message": "", "parent": ([]) }
    } else {
      hsh_array = []
    }
    data.each { |line|
      line = line.chomp()
      if ((line == "")) {
        in_message = (not in_message)
      } else {
        if (in_message) {
          ((hsh["message"] << line[(indent..-1)]) << "\n")
        } else {
          data = line.split()
          key = data.shift()
          value = data.join(" ")
          if ((key == "commit")) {
            sha = value
            if (hsh) (hsh_array << hsh)
            hsh = { "sha": (sha), "message": "", "parent": ([]) }
          }
          (key == "parent") ? ((hsh[key] << value)) : (hsh[key] = value)
        }
      }
    }
    if (hsh_array) {
      if (hsh) (hsh_array << hsh)
      hsh_array
    } else {
      hsh
    }
  },
  object_contents: function (sha, &block) {
    command("cat-file", ["-p", sha], &block)
  },
  ls_tree: function (sha) {
    data = { "blob": ({  }), "tree": ({  }) }
    command_lines("ls-tree", sha).each { |line|
      info, filenm = line.split("\t")
      mode, type, sha = info.split()
      data[type][filenm] = { mode: (mode), sha: (sha) }
    }
    data
  },
  mv: function (file1, file2) {
    command_lines("mv", ["--", file1, file2])
  },
  full_tree: function (sha) {
    command_lines("ls-tree", ["-r", sha])
  },
  tree_depth: function (sha) {
    full_tree(sha).size()
  },
  change_head_branch: function (branch_name) {
    command("symbolic-ref", ["HEAD", "refs/heads/#{branch_name}"])
  },
  branches_all: function () {
    arr = []
    command_lines("branch", "-a").each { |b|
      current = (b[0, 2] == "* ")
      (arr << [b.gsub("* ", "").strip(), current])
    }
    arr
  },
  list_files: function (ref_dir) {
    dir = File.join(@git_dir, "refs", ref_dir)
    files = []
    Dir.chdir(dir) { files = Dir.glob("**/*").select { |f| File.file?(f) } } rescue nil
    files
  },
  branch_current: function () {
    branches_all().select { |b| b[1] }.first()[0] rescue nil
  },
  grep: function (string, opts = {  }) {
    opts[object] ||= "HEAD"
    grep_opts = ["-n"]
    if (opts[ignore_case]) (grep_opts << "-i")
    if (opts[invert_match]) (grep_opts << "-v")
    (grep_opts << "-e")
    (grep_opts << string)
    if (opts[object].is_a?(String)) (grep_opts << opts[object])
    if (opts[path_limiter].is_a?(String)) {
      ((grep_opts << "--") << opts[path_limiter])
    }
    hsh = {  }
    command_lines("grep", grep_opts).each { |line|
      if (m = /(.*)\:(\d+)\:(.*)/.match(line)) {
        hsh[m[1]] ||= []
        (hsh[m[1]] << [m[2].to_i(), m[3]])
      }
    }
    hsh
  },
  diff_full: function (obj1 = "HEAD", obj2 = nil, opts = {  }) {
    diff_opts = ["-p"]
    (diff_opts << obj1)
    if (obj2.is_a?(String)) (diff_opts << obj2)
    if (opts[path_limiter].is_a?(String)) {
      ((diff_opts << "--") << opts[path_limiter])
    }
    command("diff", diff_opts)
  },
  diff_stats: function (obj1 = "HEAD", obj2 = nil, opts = {  }) {
    diff_opts = ["--numstat"]
    (diff_opts << obj1)
    if (obj2.is_a?(String)) (diff_opts << obj2)
    if (opts[path_limiter].is_a?(String)) {
      ((diff_opts << "--") << opts[path_limiter])
    }
    hsh = { total: ({ insertions: 0, deletions: 0, lines: 0, files: 0 }), files: ({  }) }
    command_lines("diff", diff_opts).each { |file|
      insertions, deletions, filename = file.split("\t")
      hsh[total][insertions] += insertions.to_i()
      hsh[total][deletions] += deletions.to_i()
      hsh[total][lines] = (hsh[total][deletions] + hsh[total][insertions])
      hsh[total][files] += 1
      hsh[files][filename] = { insertions: (insertions.to_i()), deletions: (deletions.to_i()) }
    }
    hsh
  },
  diff_files: function () {
    hsh = {  }
    command_lines("diff-files").each { |line|
      info, file = line.split("\t")
      mode_src, mode_dest, sha_src, sha_dest, type = info.split()
      hsh[file] = { path: (file), mode_file: (mode_src.to_s()[1, 7]), mode_index: (mode_dest), sha_file: (sha_src), sha_index: (sha_dest), type: (type) }
    }
    hsh
  },
  diff_index: function (treeish) {
    hsh = {  }
    command_lines("diff-index", treeish).each { |line|
      info, file = line.split("\t")
      mode_src, mode_dest, sha_src, sha_dest, type = info.split()
      hsh[file] = { path: (file), mode_repo: (mode_src.to_s()[1, 7]), mode_index: (mode_dest), sha_repo: (sha_src), sha_index: (sha_dest), type: (type) }
    }
    hsh
  },
  ls_files: function (location = nil) {
    hsh = {  }
    command_lines("ls-files", ["--stage", location]).each { |line|
      info, file = line.split("\t")
      mode, sha, stage = info.split()
      if (file =~ /^\".*\"$/) file = eval(file)
      hsh[file] = { path: (file), mode_index: (mode), sha_index: (sha), stage: (stage) }
    }
    hsh
  },
  ignored_files: function () {
    command_lines("ls-files", ["--others", "-i", "--exclude-standard"])
  },
  config_remote: function (name) {
    hsh = {  }
    config_list().each { |key, value|
      if (/remote.#{name}/.match(key)) {
        hsh[key.gsub("remote.#{name}.", "")] = value
      }
    }
    hsh
  },
  config_get: function (name) {
    do_get = lambda { command("config", ["--get", name]) }
    @git_dir ? (Dir.chdir(@git_dir, &do_get)) : (build_list().call())
  },
  global_config_get: function (name) {
    command("config", ["--global", "--get", name], false)
  },
  config_list: function () {
    build_list = lambda { |path| parse_config_list(command_lines("config", ["--list"])) }
    @git_dir ? (Dir.chdir(@git_dir, &build_list)) : (build_list.call())
  },
  global_config_list: function () {
    parse_config_list(command_lines("config", ["--global", "--list"], false))
  },
  parse_config_list: function (lines) {
    hsh = {  }
    lines.each { |line|
      key, *values = line.split("=")
      hsh[key] = values.join("=")
    }
    hsh
  },
  parse_config: function (file) {
    hsh = {  }
    parse_config_list(command_lines("config", ["--list", "--file", file], false))
  },
  config_set: function (name, value) {
    command("config", [name, value])
  },
  global_config_set: function (name, value) {
    command("config", ["--global", name, value], false)
  },
  add: function (path = ".") {
    arr_opts = ["--"]
    path.is_a?(Array) ? (arr_opts = (arr_opts + path)) : ((arr_opts << path))
    command("add", arr_opts)
  },
  remove: function (path = ".", opts = {  }) {
    arr_opts = ["-f"]
    if (opts[recursive]) (arr_opts << ["-r"])
    (arr_opts << "--")
    path.is_a?(Array) ? (arr_opts = (arr_opts + path)) : ((arr_opts << path))
    command("rm", arr_opts)
  },
  commit: function (message, opts = {  }) {
    arr_opts = ["-m", message]
    if (opts[add_all]) (arr_opts << "-a")
    if (opts[allow_empty]) (arr_opts << "--allow-empty")
    if (opts[author]) ((arr_opts << "--author") << opts[author])
    command("commit", arr_opts)
  },
  reset: function (commit, opts = {  }) {
    arr_opts = []
    if (opts[hard]) (arr_opts << "--hard")
    if (commit) (arr_opts << commit)
    command("reset", arr_opts)
  },
  apply: function (patch_file) {
    arr_opts = []
    if (patch_file) ((arr_opts << "--") << patch_file)
    command("apply", arr_opts)
  },
  apply_mail: function (patch_file) {
    arr_opts = []
    if (patch_file) ((arr_opts << "--") << patch_file)
    command("am", arr_opts)
  },
  stashes_all: function () {
    arr = []
    filename = File.join(@git_dir, "logs/refs/stash")
    if (File.exist?(filename)) {
      File.open(filename).each_with_index { |line, i|
        m = line.match(/:(.*)$/)
        (arr << [i, m[1].strip()])
      }
    }
    arr
  },
  stash_save: function (message) {
    output = command("stash save", ["--", message])
    output =~ /HEAD is now at/
  },
  stash_apply: function (id = nil) {
    id ? (command("stash apply", [id])) : (command("stash apply"))
  },
  stash_clear: function () {
    command("stash clear")
  },
  stash_list: function () {
    command("stash list")
  },
  branch_new: function (branch) {
    command("branch", branch)
  },
  branch_delete: function (branch) {
    command("branch", ["-D", branch])
  },
  checkout: function (branch, opts = {  }) {
    arr_opts = []
    if (opts[force]) (arr_opts << "-f")
    if (opts[new_branch]) ((arr_opts << "-b") << opts[new_branch])
    (arr_opts << branch)
    command("checkout", arr_opts)
  },
  checkout_file: function (version, file) {
    arr_opts = []
    (arr_opts << version)
    (arr_opts << file)
    command("checkout", arr_opts)
  },
  merge: function (branch, message = nil) {
    arr_opts = []
    if (message) ((arr_opts << "-m") << message)
    arr_opts = (arr_opts + [branch])
    command("merge", arr_opts)
  },
  unmerged: function () {
    unmerged = []
    command_lines("diff", ["--cached"]).each { |line|
      if (line =~ /^\* Unmerged path (.*)/) (unmerged << $1)
    }
    unmerged
  },
  conflicts: function () {
    this.unmerged().each { |f|
      your = Tempfile.new("YOUR-#{File.basename(f)}").path()
      command("show", ":2:#{f}", true, "> #{escape(your)}")
      their = Tempfile.new("THEIR-#{File.basename(f)}").path()
      command("show", ":3:#{f}", true, "> #{escape(their)}")
      yield(f, your, their)
    }
  },
  remote_add: function (name, url, opts = {  }) {
    arr_opts = ["add"]
    if (opts[with_fetch]) (arr_opts << "-f")
    (arr_opts << "--")
    (arr_opts << name)
    (arr_opts << url)
    command("remote", arr_opts)
  },
  remote_remove: function (name) {
    command("remote", ["rm", "--", name])
  },
  remotes: function () {
    command_lines("remote")
  },
  tags: function () {
    command_lines("tag")
  },
  tag: function (tag) {
    command("tag", tag)
  },
  fetch: function (remote) {
    command("fetch", remote)
  },
  push: function (remote, branch = "master", tags = false) {
    command("push", [remote, branch])
    if (tags) command("push", ["--tags", remote])
  },
  tag_sha: function (tag_name) {
    head = File.join(@git_dir, "refs", "tags", tag_name)
    if (File.exists?(head)) return File.read(head).chomp()
    command("show-ref", ["--tags", "-s", tag_name])
  },
  repack: function () {
    command("repack", ["-a", "-d"])
  },
  gc: function () {
    command("gc", ["--prune", "--aggressive", "--auto"])
  },
  read_tree: function (treeish, opts = {  }) {
    arr_opts = []
    if (opts[prefix]) (arr_opts << "--prefix=#{opts[prefix]}")
    arr_opts = (arr_opts + [treeish])
    command("read-tree", arr_opts)
  },
  write_tree: function () {
    command("write-tree")
  },
  commit_tree: function (tree, opts = {  }) {
    opts[message] ||= "commit tree #{tree}"
    t = Tempfile.new("commit-message")
    t.write(opts[message])
    t.close()
    arr_opts = []
    (arr_opts << tree)
    if (opts[parent]) ((arr_opts << "-p") << opts[parent])
    if (opts[parents]) {
      arr_opts = (arr_opts + [opts[parents]].map { |p| ["-p", p] }.flatten())
    }
    command("commit-tree", arr_opts, true, "< #{escape(t.path())}")
  },
  update_ref: function (branch, commit) {
    command("update-ref", [branch, commit])
  },
  checkout_index: function (opts = {  }) {
    arr_opts = []
    if (opts[prefix]) (arr_opts << "--prefix=#{opts[prefix]}")
    if (opts[force]) (arr_opts << "--force")
    if (opts[all]) (arr_opts << "--all")
    if (opts[path_limiter].is_a?(String)) {
      ((arr_opts << "--") << opts[path_limiter])
    }
    command("checkout-index", arr_opts)
  },
  archive: function (sha, file = nil, opts = {  }) {
    opts[format] ||= "zip"
    if ((opts[format] == "tgz")) {
      opts[format] = "tar"
      opts[add_gzip] = true
    }
    file ||= Tempfile.new("archive").path()
    arr_opts = []
    if (opts[format]) (arr_opts << "--format=#{opts[format]}")
    if (opts[prefix]) (arr_opts << "--prefix=#{opts[prefix]}")
    if (opts[remote]) (arr_opts << "--remote=#{opts[remote]}")
    (arr_opts << sha)
    if (opts[path]) ((arr_opts << "--") << opts[path])
    command("archive", arr_opts, true, (opts[add_gzip] ? ("| gzip") : ("") + " > #{escape(file)}"))
    return file
  },
  current_command_version: function () {
    output = command("version", [], false)
    version = output[/\d+\.\d+(\.\d+)+/]
    version.split(".").collect { |i| i.to_i() }
  },
  required_command_version: function () {
    [1, 6, 0, 0]
  },
  meets_required_version?: function () {
    current_version = this.current_command_version()
    required_version = this.required_command_version()
    return ((current_version[0] >= required_version[0]) && ((current_version[1] >= required_version[1]) && (current_version[2] ? ((current_version[2] >= required_version[2])) : (true) && current_version[3] ? ((current_version[3] >= required_version[3])) : (true))))
  },
  private()
  command_lines: function (cmd, opts = [], chdir = true, redirect = "") {
    command(cmd, opts, chdir).split("\n")
  },
  command: function (cmd, opts = [], chdir = true, redirect = "", &block) {
    ENV["GIT_DIR"] = @git_dir
    ENV["GIT_INDEX_FILE"] = @git_index_file
    ENV["GIT_WORK_TREE"] = @git_work_dir
    path = (@git_work_dir or (@git_dir or @path))
    opts = [opts].flatten().map { |s| escape(s) }.join(" ")
    git_cmd = "git #{cmd} #{opts} #{redirect} 2>&1"
    out = nil
    if ((chdir && (not (Dir.getwd() == path)))) {
      Dir.chdir(path) { out = run_command(git_cmd, &block) }
    } else {
      out = run_command(git_cmd, &block)
    }
    if (@logger) {
      @logger.info(git_cmd)
      @logger.debug(out)
    }
    if (($?.exitstatus() > 0)) {
      if ((($?.exitstatus() == 1) && (out == ""))) return ""
      raise(Git.GitExecuteError.new(((git_cmd + ":") + out.to_s())))
    }
    out
  },
  run_command: function (git_cmd, &block) {
    block_given?() ? (IO.popen(git_cmd, &block)) : (`#{git_cmd}`.chomp())
  },
  escape: function (s) {
    escaped = s.to_s().gsub("'", "'\\''")
    "\"#{escaped}\""
  },
});

