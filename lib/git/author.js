util.namespace('Git');

Git.Author = Class.extend({
  attr_accessor(name, email, date)
  initialize: function (author_string) {
    if (m = /(.*?) <(.*?)> (\d+) (.*)/.match(author_string)) {
      @name = m[1]
      @email = m[2]
      @date = Time.at(m[3].to_i())
    }
  },
});
