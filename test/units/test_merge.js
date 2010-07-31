require((File.dirname("(string)") + "/../test_helper"))
TestMerge = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
  },
  test_branch_and_merge: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "branch_merge_test")
      Dir.chdir("branch_merge_test") {
        g.branch("new_branch").in_branch("test") {
          assert_equal("new_branch", g.current_branch())
          new_file("new_file_1", "hello")
          new_file("new_file_2", "hello")
          g.add()
          true
        }
        assert_equal("master", g.current_branch())
        new_file("new_file_3", "hello")
        g.add()
        assert((not g.status()["new_file_1"]))
        assert(g.branch("new_branch").merge())
        assert(g.status()["new_file_1"])
      }
    }
  },
  test_branch_and_merge_two: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "branch_merge_test")
      Dir.chdir("branch_merge_test") {
        g.branch("new_branch").in_branch("test") {
          assert_equal("new_branch", g.current_branch())
          new_file("new_file_1", "hello")
          new_file("new_file_2", "hello")
          g.add()
          true
        }
        g.branch("new_branch2").in_branch("test") {
          assert_equal("new_branch2", g.current_branch())
          new_file("new_file_3", "hello")
          new_file("new_file_4", "hello")
          g.add()
          true
        }
        g.branch("new_branch").merge("new_branch2")
        assert((not g.status()["new_file_3"]))
        g.branch("new_branch").checkout()
        assert(g.status()["new_file_3"])
        g.branch("master").checkout()
        g.merge(g.branch("new_branch"))
        assert(g.status()["new_file_3"])
      }
    }
  },
  test_branch_and_merge_multiple: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "branch_merge_test")
      Dir.chdir("branch_merge_test") {
        g.branch("new_branch").in_branch("test") {
          assert_equal("new_branch", g.current_branch())
          new_file("new_file_1", "hello")
          new_file("new_file_2", "hello")
          g.add()
          true
        }
        g.branch("new_branch2").in_branch("test") {
          assert_equal("new_branch2", g.current_branch())
          new_file("new_file_3", "hello")
          new_file("new_file_4", "hello")
          g.add()
          true
        }
        assert((not g.status()["new_file_1"]))
        assert((not g.status()["new_file_3"]))
        g.merge(["new_branch", "new_branch2"])
        assert(g.status()["new_file_1"])
        assert(g.status()["new_file_3"])
      }
    }
  },
});
