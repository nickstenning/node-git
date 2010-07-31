util.namespace('Git');

Git.Branch = Path.extend({
  attr_accessor(full, remote, name)
  initialize: function (base, name) {
    @remote = nil
    @full = name
    @base = base
    @gcommit = nil
    @stashes = nil
    parts = name.split("/")
    if (parts[1]) {
      @remote = Git.Remote.new(@base, parts[0])
      @name = parts[1]
    } else {
      @name = parts[0]
    }
  },
  gcommit: function () {
    @gcommit ||= @base.gcommit(@full)
    @gcommit
  },
  stashes: function () {
    @stashes ||= Git.Stashes.new(@base)
  },
  checkout: function () {
    check_if_create()
    @base.checkout(@full)
  },
  archive: function (file, opts = {  }) {
    @base.lib().archive(@full, file, opts)
  },
  in_branch: function (message = "in branch work") {
    old_current = @base.lib().branch_current()
    checkout()
    yield ? (@base.commit_all(message)) : (@base.reset_hard())
    @base.checkout(old_current)
  },
  create: function () {
    check_if_create()
  },
  delete: function () {
    @base.lib().branch_delete(@name)
  },
  current: function () {
    determine_current()
  },
  merge: function (branch = nil, message = nil) {
    if (branch) {
      in_branch {
        @base.merge(branch, message)
        false
      }
    } else {
      @base.merge(@name)
    }
  },
  update_ref: function (commit) {
    @base.lib().update_ref(@full, commit)
  },
  to_a: function () {
    [@full]
  },
  to_s: function () {
    @full
  },
  private()
  check_if_create: function () {
    @base.lib().branch_new(@name) rescue nil
  },
  determine_current: function () {
    (@base.lib().branch_current() == @name)
  },
});
