require((File.dirname("(string)") + "/../test_helper"))
TestTreeOps = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
    @git = Git.open(@wdir)
  },
  test_read_tree: function () {
    in_temp_dir {
      g = Git.clone(@wbare, "test")
      g.chdir {
        g.branch("testbranch1").in_branch("tb commit 1") {
          new_file("test-file1", "blahblahblah2")
          g.add()
          true
        }
        g.branch("testbranch2").in_branch("tb commit 2") {
          new_file("test-file2", "blahblahblah3")
          g.add()
          true
        }
        g.branch("testbranch3").in_branch("tb commit 3") {
          new_file("test-file3", "blahblahblah4")
          g.add()
          true
        }
        tr = g.with_temp_index {
          g.read_tree("testbranch1")
          g.read_tree("testbranch2", prefix: "b2/")
          g.read_tree("testbranch3", prefix: "b2/b3/")
          index = g.ls_files()
          assert(index["b2/test-file2"])
          assert(index["b2/b3/test-file3"])
          g.write_tree()
        }
        assert_equal("2423ef1b38b3a140bbebf625ba024189c872e08b", tr)
        tr = g.with_temp_index {
          g.add()
          g.read_tree("testbranch1", prefix: "b1/")
          g.read_tree("testbranch3", prefix: "b2/b3/")
          index = g.ls_files()
          assert(index["example.txt"])
          assert(index["b1/test-file1"])
          assert((not index["b2/test-file2"]))
          assert(index["b2/b3/test-file3"])
          g.write_tree()
        }
        assert_equal("aa7349e1cdaf4b85cc6a6a0cf4f9b3f24879fa42", tr)
        tr = nil
        g.with_temp_working {
          tr = g.with_temp_index {
            assert_raises(Git.GitExecuteError) { g.add() }
            g.read_tree("testbranch1", prefix: "b1/")
            g.read_tree("testbranch3", prefix: "b1/b3/")
            index = g.ls_files()
            assert((not index["example.txt"]))
            assert(index["b1/test-file1"])
            assert((not index["b2/test-file2"]))
            assert(index["b1/b3/test-file3"])
            g.write_tree()
          }
          assert_equal("b40f7a9072cdec637725700668f8fdebe39e6d38", tr)
        }
        c = g.commit_tree(tr, parents: "HEAD")
        assert(c.commit?())
        assert_equal("b40f7a9072cdec637725700668f8fdebe39e6d38", c.gtree().sha())
        tmp = Tempfile.new("tesxt")
        tmppath = tmp.path()
        tmp.unlink()
        tr2 = g.with_index(tmppath) {
          g.read_tree("testbranch1", prefix: "b1/")
          g.read_tree("testbranch3", prefix: "b3/")
          index = g.ls_files()
          assert((not index["b2/test-file2"]))
          assert(index["b3/test-file3"])
          g.commit("hi")
        }
        assert(c.commit?())
        files = g.ls_files()
        assert((not files["b1/example.txt"]))
        g.branch("newbranch").update_ref(c)
        g.checkout("newbranch")
        assert((not files["b1/example.txt"]))
        assert_equal("b40f7a9072cdec637725700668f8fdebe39e6d38", c.gtree().sha())
        g.with_temp_working {
          assert((not File.directory?("b1")))
          g.checkout_index()
          assert((not File.directory?("b1")))
          g.checkout_index(all: (true))
          assert(File.directory?("b1"))
        }
      }
    }
  },
});
