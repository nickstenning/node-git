require 'rubygems'
require 'ruby_parser'
require 'pp'

require File.dirname(__FILE__) + '/ruby2javascript'

if $0 == __FILE__

  ruby = open(ARGV.shift).read

  parser = RubyParser.new
  sexp   = parser.process(ruby)
  rb2js  = Ruby2Javascript.new

  puts rb2js.process(sexp)
end
