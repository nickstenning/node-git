util.namespace('Git');

Git.Branches = Class.extend({
  include(Enumerable)
  initialize: function (base) {
    @branches = {  }
    @base = base
    @base.lib().branches_all().each { |b|
      @branches[b[0]] = Git.Branch.new(@base, b[0])
    }
  },
  local: function () {
    this.select { |b| (not b.remote()) }
  },
  remote: function () {
    this.select { |b| b.remote() }
  },
  size: function () {
    @branches.size()
  },
  each: function (&block) {
    @branches.values().each(&block)
  },
  []: function (symbol) {
    @branches[symbol.to_s()]
  },
  to_s: function () {
    out = ""
    @branches.each { |k, b|
      (((out << b.current() ? ("* ") : ("  ")) << b.to_s()) << "\n")
    }
    out
  },
});
