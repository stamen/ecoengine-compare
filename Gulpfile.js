"use strict";

var fs = require("fs");

var copy = require("gulp-copy"),
    gulp       = require("gulp"),
    hb         = require("gulp-hb"),
    jshint     = require("gulp-jshint"),
    rename     = require("gulp-rename"),
    replace    = require("gulp-replace"),
    run        = require("gulp-run"),
    sourcemaps = require("gulp-sourcemaps"),
    uglify     = require("gulp-uglify"),
    env        = require('gulp-env'),
    webserver  = require("gulp-webserver");

// Gulp mix-ins

require("gulp-autopolyfiller");
require("gulp-concat");
require("gulp-watch");

var paths = {
  sass: "./sass",
  css: "./public/css",
  templates: "./templates/*.handlebars",
  js: "./js/*.js",
  publicJs: "./public/js"
};

//
// Run all default tasks
//
gulp.task("default",function() {
  gulp.start("set-env");
  gulp.start("lint");
  gulp.start("copyjs");
  gulp.start("uglify");
  gulp.start("templates");
  gulp.start("requireConfig");
  gulp.start("sass");

  setTimeout(function() {
    gulp.start("bowercopy");
  }, 500);
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
        "L"
      ],
      expr: true
    }))
    .pipe(jshint.reporter("jshint-stylish"));
});

//
// Minify JS and move it to the
// public directory
//
gulp.task("copyjs", function() {
  gulp
    .src(paths.js)
    .pipe(copy("./public"));
});

gulp.task("uglify", function() {
  gulp
    .src(paths.js)
    .pipe(sourcemaps.init())
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
// Move bower fetched assets to
// their respective places in the
// public directory
//
gulp.task("bowercopy", function() {
  run("cp -rf bower_components ./public/js/", {}).exec();
});

gulp.task("requireConfig", function() {
  run("bower-requirejs -b js -c ./require_config.js", {}).exec();
  gulp
    .src(["./require_config.js"])
    .pipe(replace(/bower_components/g, (process.env["js-assets"] || "/") + "js/bower_components"))
    .pipe(gulp.dest("./public/js/"));
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

//
// Watch directories for changes
//
gulp.task("watch", function() {
  gulp.watch(paths.js, ["lint", "copyjs", "uglify"]);
  console.log("watching directory:", paths.js);

  gulp.watch(paths.templates, ["set-env","templates"]);
  console.log("watching directory:", paths.templates);

  gulp.watch("sass/*.scss", ["sass"]);
  console.log("watching directory:", paths.sass);

  gulp.start("webserver");
});
