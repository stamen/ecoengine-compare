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
    wrap           = require("gulp-wrap");

// Gulp mix-ins

require("gulp-autopolyfiller");
require("gulp-watch");

var paths = {
  sass: "./sass",
  css: "./public/css",
  templates: "./templates/*.handlebars",
  js: "./js/*.js",
  viewJs: "./viewJs/*.js",
  publicJs: "./public/js"
};

//
// Run all default tasks
//
gulp.task("default",function() {
  gulp.start("set-env");
  gulp.start("lint");
  gulp.start("uglify");
  gulp.start("uglifyViewJs");
  gulp.start("templates");
  gulp.start("sass");
  gulp.start("vendor-css");
});

gulp.task("dist",function() {
  gulp.start("set-env");
  env({
    vars: {
      "siteroot" : "http://studio.stamen.com/berkeley/show/compare/" //production root URL
    }
  });
  gulp.start("lint");
  gulp.start("uglify");
  gulp.start("uglifyViewJs");
  gulp.start("templates");
  gulp.start("sass");
  gulp.start("vendor-css");
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
        "STMN"
      ],
      expr: true
    }))
    .pipe(jshint.reporter("jshint-stylish"));
});

gulp.task("uglify", function() {
  gulp
    .src(mainBowerFiles().filter(function(f) {return (f.substring(f.length-3) === ".js")}).concat([paths.js]))
    .pipe(sourcemaps.init())
    .pipe(wrap("(function(STMN){<%= contents %>}(window.STMN));"))
    .pipe(concat('ecoengine-compare.js'))
    .pipe(gulp.dest(paths.publicJs))
    .pipe(uglify({
      mangle: true,
      output: {
        beautify: false
      }
    }))
    .pipe(rename({extname: ".min.js"}))
    .pipe(sourcemaps.write("./")) // Write a sourcemap for browser debugging
    .pipe(gulp.dest(paths.publicJs));
});

gulp.task("uglifyViewJs", function() {
  gulp
  .src([paths.viewJs])
  .pipe(sourcemaps.init())
  .pipe(wrap("(function(STMN){<%= contents %>}(window.STMN));"))
  .pipe(gulp.dest(paths.publicJs))
  .pipe(uglify({
    mangle: true,
    output: {
      beautify: false
    }
  }))
  .pipe(rename({extname: ".min.js"}))
  .pipe(sourcemaps.write("./")) // Write a sourcemap for browser debugging
  .pipe(gulp.dest(paths.publicJs));
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
      data: "./src/assets/data/**/*.{js,json}",
      helpers: [
        "./helpers/*.js"
      ],
      partials: [
        "./templates/partials/*.handlebars"
      ]
    }))
    .pipe(rename({extname: ".html"}))
    .pipe(gulp.dest("./public/"));
});

//
// Serve contents of the public directory
// locally on port :8080
//
gulp.task("webserver", function() {
  gulp
    .src("./public/")
    .pipe(webserver({
      open: false, // unless you want it
      livereload: false, // unless you want it
      directoryListing: false,
      fallback: "index.html"
    }));
});

//
// Generate CSS from Sass and move it
// to the public directory
//
//
gulp.task("sass", function () {
  fs.readdirSync("./sass").forEach(function() {
    run("sass --update sass/:./public/css", {}).exec();
  });
});

gulp.task("vendor-css", function() {
  gulp
  .src(mainBowerFiles().filter(function(f) {return (f.substring(f.length-4) === ".css")}))
  .pipe(concat("vendor.css"))
  .pipe(gulp.dest(paths.css));
});

//
// Watch directories for changes
//
gulp.task("watch", function() {
  gulp.watch([paths.js, paths.viewJs], ["lint", "uglify", "uglifyViewJs"]);
  console.log("watching directory:", paths.js);

  gulp.watch(paths.templates, ["set-env","templates"]);
  console.log("watching directory:", paths.templates);

  gulp.watch("sass/*.scss", ["sass"]);
  console.log("watching directory:", paths.sass);

  gulp.start("webserver");
});
