require((File.dirname("(string)") + "/../test_helper"))
TestRemotes = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
  },
  test_remote_fun: function () {
    in_temp_dir { |path|
      loc = Git.clone(@wbare, "local")
      rem = Git.clone(@wbare, "remote")
      r = loc.add_remote("testrem", rem)
      Dir.chdir("remote") {
        new_file("test-file1", "blahblahblah1")
        rem.add()
        rem.commit("master commit")
        rem.branch("testbranch").in_branch("tb commit") {
          new_file("test-file3", "blahblahblah3")
          rem.add()
          true
        }
      }
      assert((not loc.status()["test-file1"]))
      assert((not loc.status()["test-file3"]))
      r.fetch()
      r.merge()
      assert(loc.status()["test-file1"])
      loc.merge(loc.remote("testrem").branch("testbranch"))
      assert(loc.status()["test-file3"])
    }
  },
  test_push: function () {
    in_temp_dir { |path|
      loc = Git.clone(@wbare, "local")
      rem = Git.clone(@wbare, "remote")
      r = loc.add_remote("testrem", rem)
      loc.chdir {
        new_file("test-file1", "blahblahblah1")
        loc.add()
        loc.commit("master commit")
        loc.add_tag("test-tag")
        loc.branch("testbranch").in_branch("tb commit") {
          new_file("test-file3", "blahblahblah3")
          loc.add()
          true
        }
      }
      assert((not rem.status()["test-file1"]))
      assert((not rem.status()["test-file3"]))
      loc.push("testrem")
      assert(rem.status()["test-file1"])
      assert((not rem.status()["test-file3"]))
      assert_raise(Git.GitTagNameDoesNotExist) { rem.tag("test-tag") }
      loc.push("testrem", "testbranch", true)
      rem.checkout("testbranch")
      assert(rem.status()["test-file1"])
      assert(rem.status()["test-file3"])
      assert(rem.tag("test-tag"))
    }
  },
});
