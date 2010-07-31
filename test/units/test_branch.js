require((File.dirname("(string)") + "/../test_helper"))
TestBranch = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
    @git = Git.open(@wdir)
    @commit = @git.object("1cc8667014381")
    @tree = @git.object("1cc8667014381^{tree}")
    @blob = @git.object("v2.5:example.txt")
    @branches = @git.branches()
  },
  test_branches_all: function () {
    assert(@git.branches()[master].is_a?(Git.Branch))
    assert((@git.branches().size() > 5))
  },
  test_branches_local: function () {
    bs = @git.branches().local()
    assert((bs.size() > 4))
  },
  test_branches_remote: function () {
    bs = @git.branches().remote()
    assert_equal(1, bs.size())
  },
  test_branches_single: function () {
    b = @git.branches()[test_object]
    assert_equal("test_object", b.name())
    b = @git.branches()["working/master"]
    assert_equal("master", b.name())
    assert_equal("working/master", b.full())
    assert_equal("working", b.remote().name())
    assert_equal("+refs/heads/*:refs/remotes/working/*", b.remote().fetch_opts())
    assert_equal("../working.git", b.remote().url())
  },
  test_branch_commit: function () {
    assert_equal(270, @git.branches()[test_branches].gcommit().size())
  },
  test_branch_create_and_switch: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "branch_test")
      Dir.chdir("branch_test") {
        assert((not g.branch("new_branch").current()))
        g.branch("other_branch").create()
        g.branch("new_branch").checkout()
        assert(g.branch("new_branch").current())
        assert_equal(1, g.branches().select { |b| (b.name() == "new_branch") }.size())
        new_file("test-file1", "blahblahblah1")
        new_file("test-file2", "blahblahblah2")
        assert(g.status().untracked().assoc("test-file1"))
        g.add(["test-file1", "test-file2"])
        assert((not g.status().untracked().assoc("test-file1")))
        g.reset()
        assert(g.status().untracked().assoc("test-file1"))
        assert((not g.status().added().assoc("test-file1")))
        assert_raise(Git.GitExecuteError) { g.branch("new_branch").delete() }
        assert_equal(1, g.branches().select { |b| (b.name() == "new_branch") }.size())
        g.branch("master").checkout()
        g.branch("new_branch").delete()
        assert_equal(0, g.branches().select { |b| (b.name() == "new_branch") }.size())
        g.checkout("other_branch")
        assert(g.branch("other_branch").current())
        g.checkout("master")
        assert((not g.branch("other_branch").current()))
        g.checkout(g.branch("other_branch"))
        assert(g.branch("other_branch").current())
      }
    }
  },
});
