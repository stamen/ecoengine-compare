"use strict";

var fs = require("fs");

var copy           = require("gulp-copy"),
    gulp           = require("gulp"),
    hb             = require("gulp-hb"),
    jshint         = require("gulp-jshint"),
    rename         = require("gulp-rename"),
    replace        = require("gulp-replace"),
    run            = require("gulp-run"),
    sourcemaps     = require("gulp-sourcemaps"),
    uglify         = require("gulp-uglify"),
    env            = require('gulp-env'),
    webserver      = require("gulp-webserver"),
    concat         = require('gulp-concat'),
    mainBowerFiles = require('main-bower-files'),
    wrap           = require("gulp-wrap"),
    autopolyfiller = require("gulp-autopolyfiller"),
    sass           = require("gulp-sass"),
    del            = require("del");

// Gulp mix-ins
require("gulp-watch");

var paths = {
  sass: "./sass",
  css: "./build/css",
  templates: "./templates/*.handlebars",
  js: "./js/*.js",
  viewJs: "./viewJs/*.js",
  publicJs: "./build/js"
};

//
// Run all default tasks
//
gulp.task("default",function() {
  gulp.start("cleanup");
  gulp.start("set-env");
  gulp.start("lint");
  gulp.start("uglify");
  gulp.start("templates");
  gulp.start("templates:holos");
  gulp.start("sass");
  gulp.start("vendor-css");
  gulp.start("autopolyfiller");
});

gulp.task("cleanup",function(cb) {

  run("rm -rf ./build/*", {}).exec();

});


//
//
//
gulp.task('set-env', function () {
  env({
    file: ".env.json",
    vars: {
      //any vars you want to overwrite
    }
  });
});

//
// Check quality of Javascript
// warn if errors or style problems are found
//
gulp.task("lint", function() {
  gulp
    .src(paths.js)
    .pipe(jshint({
      predef: [
        "define",
        "document",
        "location",
        "navigator",
        "window",
        "history",
        "L",
        "STMN",
        "STPX",
        "interact",
        "queryString"
      ],
      expr: true
    }))
    .pipe(jshint.reporter("jshint-stylish"));
});

gulp.task("uglify", function() {
  gulp
    .src(mainBowerFiles({filter: new RegExp('.js$', 'i')}).concat([paths.js,paths.viewJs]))
    .pipe(sourcemaps.init())
    .pipe(concat('ecoengine-compare.js'))
    .pipe(gulp.dest(paths.publicJs))
    .pipe(uglify({
      mangle: true,
      output: {
        beautify: false
      }
    }).on("error", function(e) {
      console.log("Uglify error:\x07",e.message, " on line: ", e.lineNumber);
      return this.end();
    }))
    .pipe(rename({extname: ".min.js"}))
    .pipe(sourcemaps.write("./")) // Write a sourcemap for browser debugging
    .pipe(gulp.dest(paths.publicJs));
});

gulp.task('autopolyfiller', function () {
  return gulp.src(paths.publicJs + "/*.js")
      .pipe(autopolyfiller('polyfill.js'))
      .pipe(gulp.dest("./build/legacy"));
});

//
// Build handlebars templates
// and create html files from them in
// the public directory
//
gulp.task("templates", function() {
  gulp
    .src("./templates/*.handlebars")
    .pipe(hb({
      data: "./data/**/*.{js,json}",
      helpers: [
        "./helpers/*.js"
      ],
      partials: [
        "./templates/partials/*.handlebars"
      ]
    }))
    .pipe(rename({extname: ".html"}))
    .pipe(gulp.dest("./build/"));
});

gulp.task("templates:holos", function() {
  gulp
    .src("./templates/*.handlebars")
    .pipe(hb({
      data: ["./data/**/*.{js,json}","./holos/holos-templates.json"],
      helpers: [
        "./helpers/*.js"
      ],
      partials: [
        "./templates/partials/*.handlebars"
      ]
    }))
    .pipe(rename({extname: ".jinja2.html"}))
    .pipe(gulp.dest("./build/"));
});

//
// Serve contents of the public directory
// locally on port :5000
//
gulp.task("webserver", function() {
  gulp
    .src("./build/")
    .pipe(webserver({
      open: false, // unless you want it
      livereload: false, // unless you want it
      directoryListing: false,
      fallback: "index.html",
      host:"0.0.0.0",
      port:5000
    }));
});

//
// Generate CSS from Sass and move it
// to the public directory
//
//
gulp.task('sass', function () {
  return gulp.src("./sass/**")
      .pipe(sass())
      .pipe(gulp.dest("./build/css/"));
});

gulp.task("vendor-css", function() {
  gulp
  .src(mainBowerFiles({filter: new RegExp('.css$', 'i')}))
  .pipe(concat("vendor.css"))
  .pipe(gulp.dest(paths.css));
});

//
// Watch directories for changes
//
gulp.task("watch", function() {
  gulp.watch(mainBowerFiles({filter: new RegExp('.js$', 'i')}).concat([paths.js, paths.viewJs]),["lint", "uglify", "autopolyfiller"]);
  console.log("watching directory:", paths.js);

  gulp.watch(paths.templates, ["set-env","templates", "templates:holos"]);
  console.log("watching directory:", paths.templates);

  gulp.watch(mainBowerFiles({filter: new RegExp('.css$', 'i')}).concat(["sass/*.scss"]), ["sass"]);
  console.log("watching directory:", paths.sass);

  gulp.start("webserver");
});
