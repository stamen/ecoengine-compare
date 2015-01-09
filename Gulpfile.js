var gulp           = require('gulp'),
    watch          = require('gulp-watch'),
    rename         = require('gulp-rename'),
    concat         = require('gulp-concat'),
    copy           = require('gulp-copy'),
    hb             = require("gulp-hb"),
    jshint         = require('gulp-jshint'),
    replace        = require('gulp-replace'),
    uglify         = require('gulp-uglify'),
    sourcemaps     = require('gulp-sourcemaps'),
    webserver      = require('gulp-webserver'),
    autopolyfiller = require('gulp-autopolyfiller'),
    run            = require('gulp-run'),
    fs             = require("fs");

var paths = {
  sass      : './sass',
  css       : './public/css',
  templates : './templates/*.handlebars',
  js        : './js/*.js',
  publicJs  : './public/js'
};

//
// Check quality of Javascript
// warn if errors or style problems are found
//
gulp.task('lint', function() {
  return gulp.src(paths.js)
  .pipe(jshint({
    "predef" : [
    "define",
    "document",
    "location",
    "navigator",
    "window",
    "history"
    ],
    "expr" : true
  }))
  .pipe(jshint.reporter('jshint-stylish'));
});

//
// Minify JS and move it to the
// public directory
//
gulp.task('copyjs', function() {

  gulp.src(paths.js)
  .pipe(copy("./public"))

});

gulp.task('uglify', function() {

  gulp.src(paths.js)
  .pipe(sourcemaps.init())
  .pipe(uglify({
    mangle: true,
    output: {
      beautify: false
    }
  }))
  .pipe(rename({extname: ".min.js"}))
  .pipe(sourcemaps.write("./")) //Write a sourcemap for browser debugging
  .pipe(gulp.dest(paths.publicJs))
});

//
// Build handlebars templates
// and create html files from them in
// the public directory
//
gulp.task('templates', function() {
  return gulp
  .src('./templates/*.handlebars')
  .pipe(hb({
    data: './src/assets/data/**/*.{js,json}',
    helpers: [
    './helpers/*.js'
    ],
    partials: [
    './templates/partials/*.handlebars'
    ]
  }))
  .pipe(rename({extname: ".html"}))
  .pipe(gulp.dest('./public/'));
});

//
// Serve contents of the public directory
// locally on port :8080
//
gulp.task('webserver', function() {
  return gulp.src('./public/')
  .pipe(webserver({
    open:false, //unless you want it
    livereload: false, //unless you want it
    directoryListing: false,
    fallback: 'index.html'
  }));
});

//
// Move bower fetched assets to
// their respective places in the
// public directory
//
gulp.task('bowercopy', function() {
  run('cp -rf bower_components ./public/js/', {}).exec();
});

gulp.task('requireConfig', function() {
  run('bower-requirejs -c ./requireConfig.js -b', {}).exec();
  gulp.src(['./requireConfig.js'])
  .pipe(replace(/bower_components/g, '/js/bower_components'))
  .pipe(gulp.dest('./public/js/'));
});

//
// Generate CSS from Sass and move it
// to the public directory
//
// There was a
//
gulp.task('sass', function () {
  new run.Command('sass --watch ./sass:./public/css', {}).exec();
})

//
// Run all default tasks
//
gulp.task('default',function(){
  gulp.start('lint');
  gulp.start('copyjs');
  gulp.start('uglify');
  gulp.start('bowercopy');
  gulp.start('templates');
  gulp.start('requireConfig');
});

//
// Watch directories For Changes
//
gulp.task('watch', function() {
  gulp.watch(paths.js, ['lint','copyjs','uglify']);
  console.log('watching directory:' + paths.js);

  gulp.watch(paths.templates, ['templates']);
  console.log('watching directory:' + paths.templates);

  gulp.watch(paths.sass, ['sass']);
  console.log('watching directory:' + paths.sass);

  gulp.start('webserver');
});
