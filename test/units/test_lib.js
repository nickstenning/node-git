require((File.dirname("(string)") + "/../test_helper"))
TestLib = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
    @lib = Git.open(@wdir).lib()
  },
  test_commit_data: function () {
    data = @lib.commit_data("1cc8667014381")
    assert_equal("scott Chacon <schacon@agadorsparticus.corp.reactrix.com> 1194561188 -0800", data["author"])
    assert_equal("94c827875e2cadb8bc8d4cdd900f19aa9e8634c7", data["tree"])
    assert_equal("test\n", data["message"])
    assert_equal(["546bec6f8872efa41d5d97a369f669165ecda0de"], data["parent"])
  },
  test_log_commits: function () {
    a = @lib.log_commits(count: 10)
    assert(a.first().is_a?(String))
    assert_equal(10, a.size())
    a = @lib.log_commits(count: 20, since: "3 years ago")
    assert(a.first().is_a?(String))
    assert_equal(20, a.size())
    a = @lib.log_commits(count: 20, since: "1 second ago")
    assert_equal(0, a.size())
    a = @lib.log_commits(count: 20, between: (["v2.5", "v2.6"]))
    assert_equal(2, a.size())
    a = @lib.log_commits(count: 20, path_limiter: "ex_dir/")
    assert_equal(1, a.size())
    a = @lib.full_log_commits(count: 20)
    assert_equal(20, a.size())
  },
  test_revparse: function () {
    assert_equal("1cc8667014381e2788a94777532a788307f38d26", @lib.revparse("1cc8667014381"))
    assert_equal("94c827875e2cadb8bc8d4cdd900f19aa9e8634c7", @lib.revparse("1cc8667014381^{tree}"))
    assert_equal("ba492c62b6227d7f3507b4dcc6e6d5f13790eabf", @lib.revparse("v2.5:example.txt"))
  },
  test_object_type: function () {
    assert_equal("commit", @lib.object_type("1cc8667014381"))
    assert_equal("tree", @lib.object_type("1cc8667014381^{tree}"))
    assert_equal("blob", @lib.object_type("v2.5:example.txt"))
    assert_equal("commit", @lib.object_type("v2.5"))
  },
  test_object_size: function () {
    assert_equal(265, @lib.object_size("1cc8667014381"))
    assert_equal(72, @lib.object_size("1cc8667014381^{tree}"))
    assert_equal(128, @lib.object_size("v2.5:example.txt"))
    assert_equal(265, @lib.object_size("v2.5"))
  },
  test_object_contents: function () {
    commit = "tree 94c827875e2cadb8bc8d4cdd900f19aa9e8634c7\n"
    (commit << "parent 546bec6f8872efa41d5d97a369f669165ecda0de\n")
    (commit << "author scott Chacon <schacon@agadorsparticus.corp.reactrix.com> 1194561188 -0800\n")
    (commit << "committer scott Chacon <schacon@agadorsparticus.corp.reactrix.com> 1194561188 -0800\n")
    (commit << "\ntest")
    assert_equal(commit, @lib.object_contents("1cc8667014381"))
    tree = "040000 tree 6b790ddc5eab30f18cabdd0513e8f8dac0d2d3ed\tex_dir\n"
    (tree << "100644 blob 3aac4b445017a8fc07502670ec2dbf744213dd48\texample.txt")
    assert_equal(tree, @lib.object_contents("1cc8667014381^{tree}"))
    blob = "1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n2"
    assert_equal(blob, @lib.object_contents("v2.5:example.txt"))
  },
  test_object_contents_with_block: function () {
    commit = "tree 94c827875e2cadb8bc8d4cdd900f19aa9e8634c7\n"
    (commit << "parent 546bec6f8872efa41d5d97a369f669165ecda0de\n")
    (commit << "author scott Chacon <schacon@agadorsparticus.corp.reactrix.com> 1194561188 -0800\n")
    (commit << "committer scott Chacon <schacon@agadorsparticus.corp.reactrix.com> 1194561188 -0800\n")
    (commit << "\ntest")
    @lib.object_contents("1cc8667014381") { |f|
      assert_equal(commit, f.read().chomp())
    }
    tree = "040000 tree 6b790ddc5eab30f18cabdd0513e8f8dac0d2d3ed\tex_dir\n"
    (tree << "100644 blob 3aac4b445017a8fc07502670ec2dbf744213dd48\texample.txt")
    @lib.object_contents("1cc8667014381^{tree}") { |f|
      assert_equal(tree, f.read().chomp())
    }
    blob = "1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n2"
    @lib.object_contents("v2.5:example.txt") { |f|
      assert_equal(blob, f.read().chomp())
    }
  },
  test_branches_all: function () {
    branches = @lib.branches_all()
    assert((branches.size() > 0))
    assert((branches.select { |b| b[1] }.size() > 0))
    assert((branches.select { |b| /\//.match(b[0]) }.size() > 0))
    assert((branches.select { |b| (not /\//.match(b[0])) }.size() > 0))
    assert((branches.select { |b| /master/.match(b[0]) }.size() > 0))
  },
  test_config_remote: function () {
    config = @lib.config_remote("working")
    assert_equal("../working.git", config["url"])
    assert_equal("+refs/heads/*:refs/remotes/working/*", config["fetch"])
  },
  test_ls_tree: function () {
    tree = @lib.ls_tree("94c827875e2cadb8bc8d4cdd900f19aa9e8634c7")
    assert_equal("3aac4b445017a8fc07502670ec2dbf744213dd48", tree["blob"]["example.txt"][sha])
    assert_equal("100644", tree["blob"]["example.txt"][mode])
    assert(tree["tree"])
  },
  test_grep: function () {
    match = @lib.grep("search", object: "gitsearch1")
    assert_equal("to search one", match["gitsearch1:scott/text.txt"].assoc(6)[1])
    assert_equal(2, match["gitsearch1:scott/text.txt"].size())
    assert_equal(2, match.size())
    match = @lib.grep("search", object: "gitsearch1", path_limiter: "scott/new*")
    assert_equal("you can't search me!", match["gitsearch1:scott/newfile"].first()[1])
    assert_equal(1, match.size())
    match = @lib.grep("SEARCH", object: "gitsearch1")
    assert_equal(0, match.size())
    match = @lib.grep("SEARCH", object: "gitsearch1", ignore_case: (true))
    assert_equal("you can't search me!", match["gitsearch1:scott/newfile"].first()[1])
    assert_equal(2, match.size())
    match = @lib.grep("search", object: "gitsearch1", invert_match: (true))
    assert_equal(6, match["gitsearch1:scott/text.txt"].size())
    assert_equal(2, match.size())
  },
});
