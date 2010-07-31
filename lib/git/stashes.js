util.namespace('Git');

Git.Stashes = Class.extend({
  include(Enumerable)
  initialize: function (base) {
    @stashes = []
    @base = base
    @base.lib().stashes_all().each { |id, message|
      @stashes.unshift(Git.Stash.new(@base, message, true))
    }
  },
  save: function (message) {
    s = Git.Stash.new(@base, message)
    if (s.saved?()) @stashes.unshift(s)
  },
  apply: function (index = nil) {
    @base.lib().stash_apply(index)
  },
  clear: function () {
    @base.lib().stash_clear()
    @stashes = []
  },
  size: function () {
    @stashes.size()
  },
  each: function (&block) {
    @stashes.each(&block)
  },
  []: function (index) {
    @stashes[index.to_i()]
  },
});
