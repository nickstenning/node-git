require("logger")
require((File.dirname("(string)") + "/../test_helper"))
TestLogger = Test.Unit.TestCase.extend({
  setup: function () {
    set_file_paths()
  },
  test_logger: function () {
    log = Tempfile.new("logfile")
    log.close()
    logger = Logger.new(log.path())
    logger.level = Logger.DEBUG
    @git = Git.open(@wdir, log: (logger))
    @git.branches().size()
    logc = File.read(log.path())
    assert(/INFO -- : git branch '-a'/.match(logc))
    assert(/DEBUG -- : \* git_grep/.match(logc))
    log = Tempfile.new("logfile")
    log.close()
    logger = Logger.new(log.path())
    logger.level = Logger.INFO
    @git = Git.open(@wdir, log: (logger))
    @git.branches().size()
    logc = File.read(log.path())
    assert(/INFO -- : git branch '-a'/.match(logc))
    assert((not /DEBUG -- : \* git_grep/.match(logc)))
  },
});
