util.namespace('Git');

Git.Stash = Class.extend({
  initialize: function (base, message, existing = false) {
    @base = base
    @message = message
    if (!(existing)) save()
  },
  save: function () {
    @saved = @base.lib().stash_save(@message)
  },
  saved?: function () {
    @saved
  },
  message: function () {
    @message
  },
  to_s: function () {
    message()
  },
});
