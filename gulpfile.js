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
nunjucks.configure( '.', { watch: false } )

// evil globals, level II ( my own one )
//
var site = {
  posts: []
}

// vinyl streams
// =============
function rename_to_slug() {
  return through2.obj( function ( vinyl, _encoding, cb ) {
    // slug is slug or slug( title )
    if( !vinyl.data.slug ) {
      vinyl.data.slug = slug( vinyl.data.title )
    }
    // rename basename to slug
    vinyl.path = path.join( vinyl.base, vinyl.data.slug + path.extname( vinyl.path ) )
    cb( undefined, vinyl )
  })
}

function may_be_add_thumbnail_as_thumbnail_style() {
  return through2.obj( function ( vinyl, _encoding, cb ) {
    if ( !vinyl.data.thumbnail_style ) {
      var thumbnail = vinyl.data.thumbnail
      vinyl.data.thumbnail_style = path.basename( thumbnail, path.extname( thumbnail ) )
    }
    cb( undefined, vinyl )
  })
}

function layout() {
  return through2.obj( function ( vinyl, _encoding, cb ) {
    vinyl.contents = new Buffer( nunjucks.render( './assets/views/post.html', { contents: vinyl.contents } ) )
    cb( undefined, vinyl )
  })
}

function taint( site ) {
  return through2.obj( function ( vinyl, _encoding, cb ) {
    vinyl.data.href = vinyl.path
    console.log( ">>>> " + JSON.stringify( vinyl.data ) )
    // write to global II
    site.posts.push( vinyl.data )
    cb( undefined, vinyl )
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
