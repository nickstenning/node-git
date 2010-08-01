require('../test_helper')
// require('git')

var suite = vows.describe('Archive')

suite.addBatch({
  'Archive': {
    topic: function () {
      node_git.get_wdir(function (path) {
        this.callback(null, Git.open(path))
      })
    },

    'should archive files': function (topic) {
      f = topic.archive("v2.6", tempfile())
      assert.isFile(f)
      f = topic.object("v2.6").archive(tempfile())
      assert.isFile(f)
      f = topic.object("v2.6").archive()
      assert.isFile(f)
      f = topic.object("v2.6").archive(tempfile(), { format: "zip" })
      assert.isFile(f)
      f = topic.object("v2.6").archive(tempfile(), { format: "tgz", prefix: "test/" })
      assert.isFile(f)
    },

    'tar': {
      topic: function(parent) {
        f = parent.object("v2.6").archive(nil, { format: "tar" })
        exec('cd /tmp; tar xvpf ' + f, function (err, stdout, stderr) {
          this.callback(stdout.split("\n"))
        })
      },

      'should make a tarball': function (lines) {
        assert.equal("ex_dir/", lines[0])
        assert.equal("example.txt", lines[2])
      }
    },

    'tar with prefix': {
      topic: function(parent) {
        f = parent.object("v2.6").archive(tempfile(), { format: "tar", prefix: "test/", path: "ex_dir/" })
        exec('cd /tmp; tar xvpf ' + f, function (err, stdout, stderr) {
          this.callback(stdout.split("\n"))
        })
      },

      'should make a tarball with prefix': function (lines) {
        assert.equal("test/", lines[0])
        assert.equal("test/ex_dir/ex.txt", lines[2])
      }
    },

    'new clone': {
      topic: function (parent) {
        node_git.in_temp_dir(function (path) { this.callback(null, parent) })
      },

      'should archive': function (topic) {
        c = Git.clone(node_git.file_paths.wbare, "new")
        // TODO: need to chdir into clone?
        f = topic.remote("origin").branch("master").archive(tempfile(), { format: "tgz" })
        assert.isFile(f)
      }
    }
  }
})

suite.export(module)