require((File.dirname("(string)") + "/../test_helper"))
TestInit = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
  },
  test_open_simple: function () {
    g = Git.open(@wdir)
    assert_equal(g.dir().path(), @wdir)
    assert_equal(g.repo().path(), File.join(@wdir, ".git"))
    assert_equal(g.index().path(), File.join(@wdir, ".git", "index"))
  },
  test_open_opts: function () {
    g = Git.open(@wdir, repository: (@wbare), index: (@index))
    assert_equal(g.repo().path(), @wbare)
    assert_equal(g.index().path(), @index)
  },
  test_git_bare: function () {
    g = Git.bare(@wbare)
    assert_equal(g.repo().path(), @wbare)
  },
  test_git_init: function () {
    in_temp_dir { |path|
      Git.init()
      assert(File.directory?(File.join(path, ".git")))
      assert(File.exists?(File.join(path, ".git", "config")))
    }
  },
  test_git_init_remote_git: function () {
    in_temp_dir { |dir|
      assert((not File.exists?(File.join(dir, "config"))))
      in_temp_dir { |path|
        Git.init(path, repository: (dir))
        assert(File.exists?(File.join(dir, "config")))
      }
    }
  },
  test_git_clone: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "bare-co")
      assert(File.exists?(File.join(g.repo().path(), "config")))
      assert(g.dir())
    }
  },
  test_git_clone_bare: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "bare.git", bare: (true))
      assert(File.exists?(File.join(g.repo().path(), "config")))
      assert_nil(g.dir())
    }
  },
  test_git_open_error: function () {
    assert_raise(ArgumentError) { g = Git.open(@wbare) }
  },
});
