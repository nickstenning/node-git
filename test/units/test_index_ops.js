require((File.dirname("(string)") + "/../test_helper"))
TestIndexOps = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
    @git = Git.open(@wdir)
  },
  test_add: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "new")
      Dir.chdir("new") {
        assert_equal("100644", g.status()["example.txt"].mode_index())
        new_file("test-file", "blahblahblah")
        assert(g.status().untracked().assoc("test-file"))
        g.add()
        assert(g.status().added().assoc("test-file"))
        assert((not g.status().untracked().assoc("test-file")))
        assert((not g.status().changed().assoc("example.txt")))
        new_file("example.txt", "hahahaha")
        assert(g.status().changed().assoc("example.txt"))
        g.add()
        assert(g.status().changed().assoc("example.txt"))
        g.commit("my message")
        assert((not g.status().changed().assoc("example.txt")))
        assert((not g.status().added().assoc("test-file")))
        assert((not g.status().untracked().assoc("test-file")))
        assert_equal("hahahaha", g.status()["example.txt"].blob().contents())
      }
    }
  },
  test_add_array: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "new")
      Dir.chdir("new") {
        new_file("test-file1", "blahblahblah1")
        new_file("test-file2", "blahblahblah2")
        assert(g.status().untracked().assoc("test-file1"))
        g.add(["test-file1", "test-file2"])
        assert(g.status().added().assoc("test-file1"))
        assert(g.status().added().assoc("test-file1"))
        assert((not g.status().untracked().assoc("test-file1")))
        g.commit("my message")
        assert((not g.status().added().assoc("test-file1")))
        assert((not g.status().untracked().assoc("test-file1")))
        assert_equal("blahblahblah1", g.status()["test-file1"].blob().contents())
      }
    }
  },
  test_remove: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "remove_test")
      Dir.chdir("remove_test") {
        assert(g.status()["example.txt"])
        g.remove("example.txt")
        assert(g.status().deleted().assoc("example.txt"))
        g.commit("deleted file")
        assert((not g.status()["example.txt"]))
      }
    }
  },
  test_reset: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "reset_test")
      Dir.chdir("reset_test") {
        new_file("test-file1", "blahblahblah1")
        new_file("test-file2", "blahblahblah2")
        assert(g.status().untracked().assoc("test-file1"))
        g.add(["test-file1", "test-file2"])
        assert((not g.status().untracked().assoc("test-file1")))
        g.reset()
        assert(g.status().untracked().assoc("test-file1"))
        assert((not g.status().added().assoc("test-file1")))
      }
    }
  },
});
