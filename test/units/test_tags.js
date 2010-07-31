require((File.dirname("(string)") + "/../test_helper"))
TestTags = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
  },
  test_tags: function () {
    in_temp_dir { |path|
      r1 = Git.clone(@wbare, "repo1")
      r2 = Git.clone(@wbare, "repo2")
      assert_raise(Git.GitTagNameDoesNotExist) { r1.tag("first") }
      r1.add_tag("first")
      r1.chdir { new_file("new_file", "new content") }
      r1.add()
      r1.commit("my commit")
      r1.add_tag("second")
      assert(r1.tags().map { |t| t.name() }.include?("first"))
      r2.add_tag("third")
      assert(r2.tags().map { |t| t.name() }.include?("third"))
      assert((not r2.tags().map { |t| t.name() }.include?("second")))
    }
  },
});
