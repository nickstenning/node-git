require("logger")
require((File.dirname("(string)") + "/../test_helper"))
TestLog = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
    @git = Git.open(@wdir)
  },
  test_get_log_entries: function () {
    log = @git.log()
    assert(log.first().is_a?(Git.Object.Commit))
  },
  test_get_log_entries: function () {
    assert_equal(30, @git.log().size())
    assert_equal(50, @git.log(50).size())
    assert_equal(10, @git.log(10).size())
  },
  test_get_log_to_s: function () {
    assert_equal(@git.log().to_s().split("\n").first(), @git.log().first().sha())
  },
  test_log_skip: function () {
    three1 = @git.log(3).to_a()[-1]
    three2 = @git.log(2).skip(1).to_a()[-1]
    three3 = @git.log(1).skip(2).to_a()[-1]
    assert_equal(three2.sha(), three3.sha())
    assert_equal(three1.sha(), three2.sha())
  },
  test_get_log_since: function () {
    l = @git.log().since("2 seconds ago")
    assert_equal(0, l.size())
    l = @git.log().since("2 years ago")
    assert_equal(30, l.size())
  },
  test_get_log_grep: function () {
    l = @git.log().grep("search")
    assert_equal(2, l.size())
  },
  test_get_log_author: function () {
    l = @git.log(5).author("chacon")
    assert_equal(5, l.size())
    l = @git.log(5).author("lazySusan")
    assert_equal(0, l.size())
  },
  test_get_log_since_file: function () {
    l = @git.log().object("example.txt")
    assert_equal(30, l.size())
    l = @git.log().between("v2.5", "test").path("example.txt")
    assert_equal(1, l.size())
  },
  test_log_file_noexist: function () {
    assert_raise(Git.GitExecuteError) {
      @git.log().object("no-exist.txt").size()
    }
  },
});
