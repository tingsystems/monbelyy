//	File:	Gulpfile.js
'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    inject = require('gulp-inject'),
    bower = require('gulp-bower-files'),
    wiredep = require('wiredep').stream,
    useref = require('gulp-useref'),
    gulpFilter = require('gulp-filter'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    uncss = require('gulp-uncss'),
    templateCache = require('gulp-angular-templatecache');


//	Compila	las	plantillas	HTML	parciales	a	JavaScript
//	para	ser	inyectadas	por	AngularJS	y	minificar	el	código
gulp.task('templates', function () {
    gulp.src('./app/templates/**/*.html')
        .pipe(templateCache({
            root: '/static/app/templates',
            module: 'templates',
            standalone: true
        }))
        .pipe(gulp.dest('./app/js'));
});


// Minifica las librerias instaladas con bower
gulp.task('bower', function () {
    var jsFilter = gulpFilter('**/*.js');
    return bower()
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('compress', function () {
    return gulp.src('./app/js/*.js')
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
    gulp.watch(['./app/**/*.html'], ['templates']);
    gulp.watch(['./app/**/*.js'], ['compress']);

});

gulp.task('default', ['watch']);
gulp.task('build', ['templates', 'bower', 'compress']);