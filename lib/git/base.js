util.namespace('Git');

Git.Base = Class.extend({
  this.bare: function (git_dir, opts = {  }) {
    this.new({ repository: (git_dir) }.merge(opts))
  },
  this.open: function (working_dir, opts = {  }) {
    this.new({ working_directory: (working_dir) }.merge(opts))
  },
  this.init: function (working_dir, opts = {  }) {
    opts = { working_directory: (working_dir), repository: (File.join(working_dir, ".git")) }.merge(opts)
    if ((opts[working_directory] && (not File.directory?(opts[working_directory])))) {
      FileUtils.mkdir_p(opts[working_directory])
    }
    Git.Lib.new(opts).init()
    this.new(opts)
  },
  this.clone: function (repository, name, opts = {  }) {
    this.new(Git.Lib.new().clone(repository, name, opts))
  },
  initialize: function (options = {  }) {
    if (working_dir = options[working_directory]) {
      options[repository] ||= File.join(working_dir, ".git")
      options[index] ||= File.join(working_dir, ".git", "index")
    }
    if (options[log]) {
      @logger = options[log]
      @logger.info("Starting Git")
    } else {
      @logger = nil
    }
    @working_directory = if (options[working_directory]) {
      Git.WorkingDirectory.new(options[working_directory])
    } else {
      nil
    }
    @repository = options[repository] ? (Git.Repository.new(options[repository])) : (nil)
    @index = options[index] ? (Git.Index.new(options[index], false)) : (nil)
  },
  dir: function () {
    @working_directory
  },
  repo: function () {
    @repository
  },
  index: function () {
    @index
  },
  set_working: function (work_dir, check = true) {
    @lib = nil
    @working_directory = Git.WorkingDirectory.new(work_dir.to_s(), check)
  },
  set_index: function (index_file, check = true) {
    @lib = nil
    @index = Git.Index.new(index_file.to_s(), check)
  },
  chdir: function () {
    Dir.chdir(dir().path()) { yield(dir().path()) }
  },
  repo_size: function () {
    size = 0
    Dir.chdir(repo().path()) {
      size, dot, *s(:call, s(:call, s(:xstr, "du -s"), :chomp, s(:arglist)), :split, s(:arglist))
    }
    size.to_i()
  },
  config: function (name = nil, value = nil) {
    if ((name && value)) {
      lib().config_set(name, value)
    } else {
      name ? (lib().config_get(name)) : (lib().config_list())
    }
  },
  object: function (objectish) {
    Git.Object.new(this, objectish)
  },
  gtree: function (objectish) {
    Git.Object.new(this, objectish, "tree")
  },
  gcommit: function (objectish) {
    Git.Object.new(this, objectish, "commit")
  },
  gblob: function (objectish) {
    Git.Object.new(this, objectish, "blob")
  },
  log: function (count = 30) {
    Git.Log.new(this, count)
  },
  status: function () {
    Git.Status.new(this)
  },
  branches: function () {
    Git.Branches.new(this)
  },
  branch: function (branch_name = "master") {
    Git.Branch.new(this, branch_name)
  },
  is_local_branch?: function (branch) {
    branch_names = this.branches().local().map { |b| b.name() }
    branch_names.include?(branch)
  },
  is_remote_branch?: function (branch) {
    branch_names = this.branches().local().map { |b| b.name() }
    branch_names.include?(branch)
  },
  is_branch?: function (branch) {
    branch_names = this.branches().map { |b| b.name() }
    branch_names.include?(branch)
  },
  remote: function (remote_name = "origin") {
    Git.Remote.new(this, remote_name)
  },
  lib: function () {
    @lib ||= Git.Lib.new(this, @logger)
  },
  grep: function (string, path_limiter = nil, opts = {  }) {
    this.object("HEAD").grep(string, path_limiter, opts)
  },
  diff: function (objectish = "HEAD", obj2 = nil) {
    Git.Diff.new(this, objectish, obj2)
  },
  add: function (path = ".") {
    this.lib().add(path)
  },
  remove: function (path = ".", opts = {  }) {
    this.lib().remove(path, opts)
  },
  reset: function (commitish = nil, opts = {  }) {
    this.lib().reset(commitish, opts)
  },
  reset_hard: function (commitish = nil, opts = {  }) {
    opts = { hard: (true) }.merge(opts)
    this.lib().reset(commitish, opts)
  },
  commit: function (message, opts = {  }) {
    this.lib().commit(message, opts)
  },
  commit_all: function (message, opts = {  }) {
    opts = { add_all: (true) }.merge(opts)
    this.lib().commit(message, opts)
  },
  checkout: function (branch = "master", opts = {  }) {
    this.lib().checkout(branch, opts)
  },
  checkout_file: function (version, file) {
    this.lib().checkout_file(version, file)
  },
  fetch: function (remote = "origin") {
    this.lib().fetch(remote)
  },
  push: function (remote = "origin", branch = "master", tags = false) {
    this.lib().push(remote, branch, tags)
  },
  merge: function (branch, message = "merge") {
    this.lib().merge(branch, message)
  },
  each_conflict: function (&block) {
    this.lib().conflicts(&block)
  },
  pull: function (remote = "origin", branch = "master", message = "origin pull") {
    fetch(remote)
    merge(branch, message)
  },
  remotes: function () {
    this.lib().remotes().map { |r| Git.Remote.new(this, r) }
  },
  add_remote: function (name, url, opts = {  }) {
    if (url.is_a?(Git.Base)) url = url.repo().path()
    this.lib().remote_add(name, url, opts)
    Git.Remote.new(this, name)
  },
  tags: function () {
    this.lib().tags().map { |r| tag(r) }
  },
  tag: function (tag_name) {
    Git.Object.new(this, tag_name, "tag", true)
  },
  add_tag: function (tag_name) {
    this.lib().tag(tag_name)
    tag(tag_name)
  },
  archive: function (treeish, file = nil, opts = {  }) {
    this.object(treeish).archive(file, opts)
  },
  repack: function () {
    this.lib().repack()
  },
  gc: function () {
    this.lib().gc()
  },
  apply: function (file) {
    if (File.exists?(file)) this.lib().apply(file)
  },
  apply_mail: function (file) {
    if (File.exists?(file)) this.lib().apply_mail(file)
  },
  with_index: function (new_index) {
    old_index = @index
    set_index(new_index, false)
    return_value = yield(@index)
    set_index(old_index)
    return_value
  },
  with_temp_index: function (&blk) {
    tempfile = Tempfile.new("temp-index")
    temp_path = tempfile.path()
    tempfile.unlink()
    with_index(temp_path, &blk)
  },
  checkout_index: function (opts = {  }) {
    this.lib().checkout_index(opts)
  },
  read_tree: function (treeish, opts = {  }) {
    this.lib().read_tree(treeish, opts)
  },
  write_tree: function () {
    this.lib().write_tree()
  },
  commit_tree: function (tree = nil, opts = {  }) {
    Git.Object.Commit.new(this, this.lib().commit_tree(tree, opts))
  },
  write_and_commit_tree: function (opts = {  }) {
    tree = write_tree()
    commit_tree(tree, opts)
  },
  update_ref: function (branch, commit) {
    branch(branch).update_ref(commit)
  },
  ls_files: function (location = nil) {
    this.lib().ls_files(location)
  },
  with_working: function (work_dir) {
    return_value = false
    old_working = @working_directory
    set_working(work_dir)
    Dir.chdir(work_dir) { return_value = yield(@working_directory) }
    set_working(old_working)
    return_value
  },
  with_temp_working: function (&blk) {
    tempfile = Tempfile.new("temp-workdir")
    temp_dir = tempfile.path()
    tempfile.unlink()
    Dir.mkdir(temp_dir, 448)
    with_working(temp_dir, &blk)
  },
  revparse: function (objectish) {
    this.lib().revparse(objectish)
  },
  ls_tree: function (objectish) {
    this.lib().ls_tree(objectish)
  },
  cat_file: function (objectish) {
    this.lib().object_contents(objectish)
  },
  current_branch: function () {
    this.lib().branch_current()
  },
});
