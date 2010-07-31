require((File.dirname("(string)") + "/../test_helper"))
TestRepack = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
  },
  test_repack: function () {
    in_temp_dir { |path|
      r1 = Git.clone(@wbare, "repo1")
      r1.chdir { new_file("new_file", "new content") }
      r1.add()
      r1.commit("my commit")
      size1 = r1.repo_size()
      r1.repack()
      assert((size1 > r1.repo_size()))
    }
  },
});
