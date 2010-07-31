require((File.dirname("(string)") + "/../test_helper"))
TestConfig = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
    @git = Git.open(@wdir)
  },
  test_config: function () {
    c = @git.config()
    assert_equal("Scott Chacon", c["user.name"])
    assert_equal("false", c["core.bare"])
  },
  test_read_config: function () {
    assert_equal("Scott Chacon", @git.config("user.name"))
    assert_equal("false", @git.config("core.bare"))
  },
  test_set_config: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "bare")
      assert_not_equal("bully", g.config("user.name"))
      g.config("user.name", "bully")
      assert_equal("bully", g.config("user.name"))
    }
  },
});
