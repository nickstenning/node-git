Dir.chdir(File.dirname("(string)")) {
  Dir.glob("**/test_*.rb") { |test_case| require(test_case) }
}
