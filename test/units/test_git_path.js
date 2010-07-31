require((File.dirname("(string)") + "/../test_helper"))
TestGitPath = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
    @git = Git.open(@wdir)
  },
  test_initalize_with_good_path_and_check_path: function () {
    path = Git.Path.new(@git.index().to_s(), true)
    assert_equal(@git.index().to_s(), path.to_s())
  },
  test_initialize_with_bad_path_and_check_path: function () {
    assert_raises(ArgumentError) {
      Git.Path.new("/this path does not exist", true)
    }
  },
  test_initialize_with_bad_path_and_no_check: function () {
    path = Git.Path.new("/this path does not exist", false)
    assert_equal("/this path does not exist", path.to_s())
  },
  test_readables: function () {
    assert(@git.dir().readable?())
    assert(@git.index().readable?())
    assert(@git.repo().readable?())
  },
  test_readables_in_temp_dir: function () {
    in_temp_dir { |dir|
      FileUtils.cp_r(@wdir, "test")
      g = Git.open(File.join(dir, "test"))
      assert(g.dir().writable?())
      assert(g.index().writable?())
      assert(g.repo().writable?())
    }
  },
});
