require 'rack-livereload'
use Rack::LiveReload
require './app'
run App
