'use strict';

// globals
// =======
var
  frontmatter = require( 'gulp-front-matter' ),
  gulp = require( 'gulp' ),
  markdown = require( 'gulp-markdown' ),
  path = require( 'path' ),
  render = require( 'gulp-nunjucks-render' ),
  rimraf = require( 'rimraf' ),
  slug = require( 'slug' ),
  through2 = require( 'through2' )

// evil globals, level I ( the chosen one )
// and why is it more evil than a required module ?
//
var nunjucks = render.nunjucks
nunjucks.configure( './assets/views', { watch: false } )

// evil globals, level II ( my own one )
//
var site = {
  posts: []
}

// helpers
// =======
function may_be_add_title_as_slug( vinyl ) {
  if( !vinyl.data.slug ) {
    vinyl.data.slug = slug( vinyl.data.title )
  }
  return vinyl
}

// vinyl streams
// =============
function rename_to_slug() {
  return through2.obj( function ( f, _encoding, cb ) {
    // slug is slug or slug( title )
    may_be_add_title_as_slug( f )
    // rename basename to slug
    f.path = path.join( f.base, f.data.slug + path.extname( f.path ) )
    cb( undefined, f )
  })
}

function layout() {
  return through2.obj( function ( f, _encoding, cb ) {
    f.contents = new Buffer( nunjucks.render( 'post.html', { contents: f.contents } ) )
    cb( undefined, f )
  })
}

function taint( site ) {
  return through2.obj( function ( f, _encoding, cb ) {
    // write to global II
    f.data.href = f.path
    console.log( ">>>> " + JSON.stringify( f.data ) )
    site.posts.push( f.data )
    cb( undefined, f )
  })
}

// tasks
// =====
gulp.task( 'clean', function ( cb ) {
  return rimraf( './site', cb )
})

gulp.task( 'images', function () {
  return gulp.src( './contents/images/*.jpg' )
    .pipe( gulp.dest( './site/images' ) )
})

gulp.task( 'posts', function () {
  return gulp.src( './contents/posts/*.md' )
    .pipe( frontmatter( { property: 'data' } ) )
    .pipe( rename_to_slug() )
    .pipe( markdown() )
    .pipe( layout() )
    .pipe( gulp.dest( './site/posts' ) )
    .pipe( taint( site ) )
})

gulp.task( 'site', [ 'posts' ], function () {
  return gulp.src( './assets/views/index.html' )
    .pipe( render( site ) )       // read from global II
    .pipe( gulp.dest( './site' ) )
})

gulp.task( 'scripts', function () {
  return gulp.src( [ 'node_modules/holderjs/holder.js' ] )
    .pipe( gulp.dest( './site/scripts' ) )
})

gulp.task( 'styles', function () {
  return gulp.src( 'node_modules/bootstrap/dist/css/bootstrap.css' )
    .pipe( gulp.dest( './site/styles' ) )
})

// omakase
// =======
gulp.task( 'build', [ 'images', 'site', 'scripts', 'styles' ] )
gulp.task( 'default', [ 'build' ] )
