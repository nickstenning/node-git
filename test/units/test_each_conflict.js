require((File.dirname("(string)") + "/../test_helper"))
TestEachConflict = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
    @git = Git.open(@wdir)
  },
  test_conflicts: function () {
    in_temp_dir { |path|
      g = Git.clone(@wbare, "branch_merge_test")
      Dir.chdir("branch_merge_test") {
        g.branch("new_branch").in_branch("test") {
          new_file("example.txt", "1\n2\n3")
          g.add()
          true
        }
        g.branch("new_branch2").in_branch("test") {
          new_file("example.txt", "1\n4\n3")
          g.add()
          true
        }
        g.merge("new_branch")
        begin
          g.merge("new_branch2")
        rescue
          # do nothing
        end
        g.each_conflict { |file, your, their|
          assert_equal("example.txt", file)
          assert_equal("1\n2\n3\n", File.read(your))
          assert_equal("1\n4\n3\n", File.read(their))
        }
      }
    }
  },
});
