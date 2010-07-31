util.namespace('Git');

Git.GitTagNameDoesNotExist = StandardError.extend({
});
Git.Object = Class.extend({
  Git.Object.AbstractObject = Class.extend({
    attr_accessor(objectish, size, type, mode)
    initialize: function (base, objectish) {
      @base = base
      @objectish = objectish.to_s()
      @contents = nil
      @trees = nil
      @size = nil
      @sha = nil
    },
    sha: function () {
      @sha ||= @base.lib().revparse(@objectish)
    },
    size: function () {
      @size ||= @base.lib().object_size(@objectish)
    },
    contents: function (&block) {
      if (block_given?()) {
        @base.lib().object_contents(@objectish, &block)
      } else {
        @contents ||= @base.lib().object_contents(@objectish)
      }
    },
    contents_array: function () {
      this.contents().split("\n")
    },
    to_s: function () {
      @objectish
    },
    grep: function (string, path_limiter = nil, opts = {  }) {
      opts = { object: (sha()), path_limiter: (path_limiter) }.merge(opts)
      @base.lib().grep(string, opts)
    },
    diff: function (objectish) {
      Git.Diff.new(@base, @objectish, objectish)
    },
    log: function (count = 30) {
      Git.Log.new(@base, count).object(@objectish)
    },
    archive: function (file = nil, opts = {  }) {
      @base.lib().archive(@objectish, file, opts)
    },
    tree?: function () {
      false
    },
    blob?: function () {
      false
    },
    commit?: function () {
      false
    },
    tag?: function () {
      false
    },
  });
  Git.Object.Blob = AbstractObject.extend({
    initialize: function (base, sha, mode = nil) {
      super(base, sha)
      @mode = mode
    },
    blob?: function () {
      true
    },
  });
  Git.Object.Tree = AbstractObject.extend({
    @trees = nil
    @blobs = nil
    initialize: function (base, sha, mode = nil) {
      super(base, sha)
      @mode = mode
    },
    children: function () {
      blobs().merge(subtrees())
    },
    blobs: function () {
      check_tree()
      @blobs
    },
    alias_method(files, blobs)
    trees: function () {
      check_tree()
      @trees
    },
    alias_method(subtrees, trees)
    alias_method(subdirectories, trees)
    full_tree: function () {
      @base.lib().full_tree(@objectish)
    },
    depth: function () {
      @base.lib().tree_depth(@objectish)
    },
    tree?: function () {
      true
    },
    private()
    check_tree: function () {
      if (!(@trees)) {
        @trees = {  }
        @blobs = {  }
        data = @base.lib().ls_tree(@objectish)
        data["tree"].each { |k, d|
          @trees[k] = Git.Object.Tree.new(@base, d[sha], d[mode])
        }
        data["blob"].each { |k, d|
          @blobs[k] = Git.Object.Blob.new(@base, d[sha], d[mode])
        }
      }
    },
  });
  Git.Object.Commit = AbstractObject.extend({
    initialize: function (base, sha, init = nil) {
      super(base, sha)
      @tree = nil
      @parents = nil
      @author = nil
      @committer = nil
      @message = nil
      if (init) set_commit(init)
    },
    message: function () {
      check_commit()
      @message
    },
    name: function () {
      @base.lib().namerev(sha())
    },
    gtree: function () {
      check_commit()
      Tree.new(@base, @tree)
    },
    parent: function () {
      parents().first()
    },
    parents: function () {
      check_commit()
      @parents
    },
    author: function () {
      check_commit()
      @author
    },
    author_date: function () {
      author().date()
    },
    committer: function () {
      check_commit()
      @committer
    },
    committer_date: function () {
      committer().date()
    },
    alias_method(date, committer_date)
    diff_parent: function () {
      diff(parent())
    },
    set_commit: function (data) {
      if (data["sha"]) @sha = data["sha"]
      @committer = Git.Author.new(data["committer"])
      @author = Git.Author.new(data["author"])
      @tree = Git.Object.Tree.new(@base, data["tree"])
      @parents = data["parent"].map { |sha| Git.Object.Commit.new(@base, sha) }
      @message = data["message"].chomp()
    },
    commit?: function () {
      true
    },
    private()
    check_commit: function () {
      if (!(@tree)) {
        data = @base.lib().commit_data(@objectish)
        set_commit(data)
      }
    },
  });
  Git.Object.Tag = AbstractObject.extend({
    attr_accessor(name)
    initialize: function (base, sha, name) {
      super(base, sha)
      @name = name
    },
    tag?: function () {
      true
    },
  });
  this.new: function (base, objectish, type = nil, is_tag = false) {
    if (is_tag) {
      sha = base.lib().tag_sha(objectish)
      if ((sha == "")) raise(Git.GitTagNameDoesNotExist.new(objectish))
      return Git.Object.Tag.new(base, sha, objectish)
    }
    type ||= base.lib().object_type(objectish)
    klass = switch (type) {
    case (/blob/):
      Blob
    case (/commit/):
      Commit
    case (/tree/):
      Tree
    default:
      // do nothing
    }
    klass.new(base, objectish)
  },
});
