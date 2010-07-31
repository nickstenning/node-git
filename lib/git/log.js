util.namespace('Git');

Git.Log = Class.extend({
  include(Enumerable)
  initialize: function (base, count = 30) {
    dirty_log()
    @base = base
    @count = count
    @commits = nil
    @author = nil
    @grep = nil
    @object = nil
    @path = nil
    @since = nil
    @skip = nil
    @until = nil
    @between = nil
  },
  object: function (objectish) {
    dirty_log()
    @object = objectish
    return this
  },
  author: function (regex) {
    dirty_log()
    @author = regex
    return this
  },
  grep: function (regex) {
    dirty_log()
    @grep = regex
    return this
  },
  path: function (path) {
    dirty_log()
    @path = path
    return this
  },
  skip: function (num) {
    dirty_log()
    @skip = num
    return this
  },
  since: function (date) {
    dirty_log()
    @since = date
    return this
  },
  until: function (date) {
    dirty_log()
    @until = date
    return this
  },
  between: function (sha1, sha2 = nil) {
    dirty_log()
    @between = [sha1, sha2]
    return this
  },
  to_s: function () {
    this.map { |c| c.to_s() }.join("\n")
  },
  size: function () {
    check_log()
    @commits.size() rescue nil
  },
  each: function (&block) {
    check_log()
    @commits.each(&block)
  },
  first: function () {
    check_log()
    @commits.first() rescue nil
  },
  private()
  dirty_log: function () {
    @dirty_flag = true
  },
  check_log: function () {
    if (@dirty_flag) {
      run_log()
      @dirty_flag = false
    }
  },
  run_log: function () {
    log = @base.lib().full_log_commits(count: (@count), object: (@object), path_limiter: (@path), since: (@since), author: (@author), grep: (@grep), skip: (@skip), until: (@until), between: (@between))
    @commits = log.map { |c| Git.Object.Commit.new(@base, c["sha"], c) }
  },
});
