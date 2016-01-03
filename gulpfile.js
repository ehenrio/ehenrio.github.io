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
  projects: []
}

// vinyl streams
// =============
function may_be_add_resume() {
  return through2.obj( function ( vinyl, _encoding, cb ) {
    // resume is resume or first 64 chars of body
    if( !vinyl.data.resume ) {
      var resume = vinyl.contents.slice( 0, 64 ).toString() 
      if ( resume.length >= 64 ) {
        resume = resume.slice( 0, 61 ) + "..."
      }
      vinyl.data.resume = resume 
    }
    cb( undefined, vinyl )
  })
}

function rename_to_slug() {
  return through2.obj( function ( vinyl, _encoding, cb ) {
    // slug is slug or slug( title )... downcase
    if( !vinyl.data.slug ) {
      vinyl.data.slug = slug( vinyl.data.title ).toLowerCase()
    }
    // rename basename to slug
    vinyl.path = path.join( vinyl.base, vinyl.data.slug + path.extname( vinyl.path ) )
    cb( undefined, vinyl )
  })
}

function layout() {
  return through2.obj( function ( vinyl, _encoding, cb ) {
    vinyl.contents = new Buffer( nunjucks.render( './assets/views/project.html', { contents: vinyl.contents } ) )
    cb( undefined, vinyl )
  })
}

function taint( site ) {
  return through2.obj( function ( vinyl, _encoding, cb ) {
    vinyl.data.href = vinyl.path
    // write to global II
    site.projects.push( vinyl.data )
    cb( undefined, vinyl )
  })
}

// tasks
// =====
gulp.task( 'clean', function ( cb ) {
  return rimraf( './site', cb )
})

gulp.task( 'images', function () {
  return gulp.src( './contents/images/**/*.jpg' )
    .pipe( gulp.dest( './site/images' ) )
})

gulp.task( 'projects', function () {
  // projects name MUST have format YYYY-MM-DD-anything.md
  // the date part provides date in front matter
  //
  return gulp.src( './contents/projects/*.md' )
    .pipe( frontmatter( { property: 'data' } ) )
    .pipe( may_be_add_resume() )
    .pipe( rename_to_slug() )
    .pipe( markdown() )
    .pipe( layout() )
    .pipe( gulp.dest( './site/projects' ) )
    .pipe( taint( site ) )
})

gulp.task( 'site', [ 'projects' ], function () {
  return gulp.src( './assets/views/index.html' )
    .pipe( render( site ) )       // read from global II
    .pipe( gulp.dest( './site' ) )
})

gulp.task( 'scripts', function () {
  return gulp.src( [ 'node_modules/holderjs/holder.js' ] )
    .pipe( gulp.dest( './site/scripts' ) )
})

// styles are bunch of files, could be concat
//
gulp.task( 'styles', function () {
  return gulp.src([
    'node_modules/bootstrap/dist/css/bootstrap.css',
    'assets/styles/*.css'
    ])
    .pipe( gulp.dest( './site/styles' ) )
})

// omakase
// =======
gulp.task( 'build', [ 'images', 'site', 'scripts', 'styles' ] )
gulp.task( 'default', [ 'build' ] )
