requireDir = require 'require-dir'
_ = require 'lodash'
browserify = require 'browserify'
source = require 'vinyl-source-stream'
request = require 'superagent'
gulp = require 'gulp'
fs = require 'fs'
del = require 'del'
CSON = require 'cson'
plugins = require('gulp-load-plugins')()
index = require './gulp/plugins/index'
assets = require './gulp/plugins/assets'
plantsSrc = require './gulp/plugins/plants-src'
browserSync = require 'browser-sync'
runSequence = require 'run-sequence'
LibAPI = require './src/scripts/libapi'
path = require 'path'
reload = browserSync.reload
swig = require 'swig'
slug = require 'slug'
slug.defaults.mode = 'rfc3986'

config = CSON.requireFile 'src/config.cson'
throw config if config instanceof Error

swig.setDefaults loader: swig.loaders.fs('templates')

swig.setFilter 'baseurl', (input) -> config.site.baseurl + input
swig.setFilter 'absolute', (input) -> config.site.url + config.site.baseurl + input
swig.setFilter 'truncate', (input, maxlength) -> input.slice(0, maxlength)

gulp.task 'clean', (cb) ->
  del(['build', 'dist'], cb)

gulp.task 'bower', ->
  gulp.src 'bower_components/**/*'
    .pipe plugins.changed 'build/bower_components'
    .pipe gulp.dest 'build/bower_components'

gulp.task 'fonts', ->
  gulp.src [
      'bower_components/bootstrap/fonts/**/*'
    ]
    .pipe gulp.dest 'build/fonts'
    .pipe reload stream: true

gulp.task 'cjsx', ->
  gulp.src [
      'src/**/*.cjsx'
    ]
    .pipe plugins.changed 'build', extension: '.js'
    .pipe plugins.cjsx bare: true
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'coffee', ->
  gulp.src [
      'src/**/*.coffee'
    ]
    .pipe plugins.changed 'build', extension: '.js'
    .pipe plugins.coffee bare: true
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'markdown', ->
  gulp.src [
      'src/**/*.md'
    ]
    .pipe plugins.changed 'build', extension: '.html'
    .pipe plugins.frontMatter property: 'data'
    .pipe plugins.data config: config
    .pipe index root: 'src'
    .pipe plugins.markdown()
    .pipe gulp.dest 'build'

gulp.task 'swig', ->
  gulp.src [
      'src/**/*.html'
    ]
    .pipe plugins.frontMatter property: 'data'
    .pipe plugins.data config: config
    .pipe index root: 'src'
    .pipe plugins.swig
      defaults: cache: false
    .pipe gulp.dest 'build'

gulp.task 'sass', ->
  gulp.src [
      'src/**/*.{sass,scss}'
    ]
    .pipe plugins.changed 'build', extension: '.css'
    .pipe plugins.sass outputStyle: 'compressed'
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'less', ->
  gulp.src [
      'src/**/*.less'
    ]
    .pipe plugins.changed 'build', extension: '.css'
    .pipe plugins.less compress: true
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'original-images', ->
  LibAPI.fetchPlants (err, plants) ->
    return console.error(err) if err?

    plantsSrc plants
      .pipe plugins.save 'pristine'
      .pipe gulp.dest 'original'

      .pipe plugins.save.restore 'pristine'
      .pipe plugins.imageResize
        width: 120
        height: 120
        upscale: false
        crop: true
        gravity: 'Center'
        format: 'png'
        filter: 'Catrom'
        sharpen: true
      .pipe gulp.dest 'src'

gulp.task 'images', ->
  gulp.src [
        'src/**/*.{png,gif,jpg}'
    ]
      .pipe gulp.dest 'build'

gulp.task 'assets', [ 'build' ], ->
  gulp.src [
    '!build/bower_components/**/*.html',
    'build/**/*.html'
    ], base: 'build'
    .pipe assets root: 'build', config: config
    .pipe gulp.dest 'build'

gulp.task 'minify-css', ->
  gulp.src [
    'build/styles/**/*.css'
    ]
    .pipe plugins.minifyCss()
    .pipe gulp.dest 'build/styles'

gulp.task 'minify-js', ->
  gulp.src [
    'build/assets/**/*.js'
    ]
    .pipe plugins.uglify()
    .pipe gulp.dest 'build/assets'

gulp.task 'minify-images', ->
  gulp.src [
      'src/**/*.{png,gif,jpg}'
    ], base: 'src'
    .pipe plugins.changed 'build'
    .pipe plugins.imagemin()
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'minify-assets', [ 'minify-css', 'minify-js', 'minify-images' ]

gulp.task 'serve', ->
  bs = browserSync.create()

  bs.init
    logLevel: 'warn'
    server:
      baseDir: 'build'

  gulp.watch 'bower_components/**/*', [ 'bower' ]
  gulp.watch 'src/**/*.cjsx', [ 'cjsx' ]
  gulp.watch 'src/**/*.coffee', [ 'coffee' ]
  gulp.watch('src/**/*.md', [ 'markdown' ]).on('change', reload)
  gulp.watch([
    'src/**/*.html',
    'templates/**/*.html'
  ], [ 'swig' ]).on('change', reload)
  gulp.watch 'src/**/*.{sass,scss}', [ 'sass' ]
  gulp.watch 'src/**/*.less', [ 'less' ]

gulp.task 'deploy-gh-pages', [ 'build-gh-pages' ], ->
  gulp.src 'build/**/*'
    .pipe plugins.ghPages()

gulp.task 'build-gh-pages', [ 'clean' ], (cb) ->
  config.site.url = 'http://datashaman.github.io'
  config.site.baseurl = '/grow'
  # runSequence 'assets', 'minify-assets', cb
  runSequence 'build', 'minify-assets', cb

gulp.task 'components', [ 'bower' ]
gulp.task 'content', [ 'markdown', 'swig' ]
gulp.task 'scripts', [ 'cjsx', 'coffee' ]
gulp.task 'styles', [ 'sass', 'less' ]
gulp.task 'build', [ 'components', 'scripts', 'content', 'styles', 'fonts', 'images' ], (cb) ->
  browserify('./build/scripts/slug.js')
    .ignore('unicode/category/So')
    .bundle()
    .pipe source('scripts/slug.js')
    .pipe gulp.dest './build'
  browserify('./build/scripts/superagent.js')
    .bundle()
    .pipe source('scripts/superagent.js')
    .pipe gulp.dest './build'
  cb()

gulp.task 'deploy', [ 'deploy-gh-pages' ]
gulp.task 'default', [ 'build' ]
