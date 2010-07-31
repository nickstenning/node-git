require((File.dirname("(string)") + "/../test_helper"))
TestArchive = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
    @git = Git.open(@wdir)
  },
  tempfile: function () {
    Tempfile.new("archive-test").path()
  },
  test_archive: function () {
    f = @git.archive("v2.6", tempfile())
    assert(File.exists?(f))
    f = @git.object("v2.6").archive(tempfile())
    assert(File.exists?(f))
    f = @git.object("v2.6").archive()
    assert(File.exists?(f))
    f = @git.object("v2.6").archive(nil, format: "tar")
    assert(File.exists?(f))
    lines = `cd /tmp; tar xvpf #{f}`.split("\n")
    assert_equal("ex_dir/", lines[0])
    assert_equal("example.txt", lines[2])
    f = @git.object("v2.6").archive(tempfile(), format: "zip")
    assert(File.file?(f))
    f = @git.object("v2.6").archive(tempfile(), format: "tgz", prefix: "test/")
    assert(File.exists?(f))
    f = @git.object("v2.6").archive(tempfile(), format: "tar", prefix: "test/", path: "ex_dir/")
    assert(File.exists?(f))
    lines = `cd /tmp; tar xvpf #{f}`.split("\n")
    assert_equal("test/", lines[0])
    assert_equal("test/ex_dir/ex.txt", lines[2])
    in_temp_dir {
      c = Git.clone(@wbare, "new")
      c.chdir {
        f = @git.remote("origin").branch("master").archive(tempfile(), format: "tgz")
        assert(File.exists?(f))
      }
    }
  },
});
