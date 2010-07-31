require("test/unit")
require("fileutils")
require("logger")
require((File.dirname("(string)") + "/../lib/git"))
Test.Unit.TestCase = Class.extend({
  set_file_paths: function () {
    cwd = `pwd`.chomp()
    if (File.directory?(File.join(cwd, "files"))) {
      @test_dir = File.join(cwd, "files")
    } else {
      if (File.directory?(File.join(cwd, "..", "files"))) {
        @test_dir = File.join(cwd, "..", "files")
      } else {
        if (File.directory?(File.join(cwd, "tests", "files"))) {
          @test_dir = File.join(cwd, "tests", "files")
        }
      }
    }
    @wdir_dot = File.expand_path(File.join(@test_dir, "working"))
    @wbare = File.expand_path(File.join(@test_dir, "working.git"))
    @index = File.expand_path(File.join(@test_dir, "index"))
    @wdir = create_temp_repo(@wdir_dot)
  },
  teardown: function () {
    if (@tmp_path) FileUtils.rm_r(@tmp_path)
  },
  create_temp_repo: function (clone_path) {
    filename = (("git_test" + Time.now().to_i().to_s()) + rand(300).to_s().rjust(3, "0"))
    @tmp_path = File.join("/tmp/", filename)
    FileUtils.mkdir_p(@tmp_path)
    FileUtils.cp_r(clone_path, @tmp_path)
    tmp_path = File.join(@tmp_path, "working")
    Dir.chdir(tmp_path) { FileUtils.mv("dot_git", ".git") }
    tmp_path
  },
  in_temp_dir: function (remove_after = true) {
    filename = (("git_test" + Time.now().to_i().to_s()) + rand(300).to_s().rjust(3, "0"))
    tmp_path = File.join("/tmp/", filename)
    FileUtils.mkdir(tmp_path)
    Dir.chdir(tmp_path) { yield(tmp_path) }
    if (remove_after) FileUtils.rm_r(tmp_path)
  },
  new_file: function (name, contents) {
    File.open(name, "w") { |f| f.puts(contents) }
  },
  append_file: function (name, contents) {
    File.open(name, "a") { |f| f.puts(contents) }
  },
});
