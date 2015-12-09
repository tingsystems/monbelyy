//	File:	gulpfile.js
'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    inject = require('gulp-inject'),
    wiredep = require('wiredep').stream;

//	Servidor	web	de	desarrollo
gulp.task('server', function () {
    connect.server({
        root: './app',
        hostname: '0.0.0.0',
        port: 8080,
        livereload: true
    });
});

//	Busca	errores	en	el	JS	y	nos	los	muestra	por	pantalla
gulp.task('jshint', function () {
    return gulp.src('./app/js/**/*.js').pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

//	Pre-procesa	archivos	Stylus	a	CSS	y	recarga	los	cambios
gulp.task('css', function () {
    gulp.src('./app/css/main.styl')
        .pipe(stylus({use: nib()}))
        .pipe(gulp.dest('./app/css'))
        .pipe(connect.reload());
});
//	Recarga	el	navegador	cuando	hay	cambios	en	el	HTML
gulp.task('html', function () {
    gulp.src('./app/**/*.html')
        .pipe(connect.reload());
});


/*
 Busca en las carpetas de estilos	y javascript los	archivos
 que hayamos creado para inyectarlos en el index.html
 */
gulp.task('inject', function () {
    var sources = gulp.src(['./app/js/**/*.js', './app/css/**/*.css']);
    return gulp.src('index.html', {cwd: './app'})
        .pipe(inject(sources, {
            read: false,
            ignorePath: '/app'
        }))
        .pipe(gulp.dest('./app'));
});

//	Inyecta	las	librerias que instalemos vía Bower
gulp.task('wiredep', function () {
    gulp.src('./app/index.html')
        .pipe(wiredep({
            directory: './app/lib'
        }))
        .pipe(gulp.dest('./app'));
});

//	Vigila	cambios	que	se	produzcan	en	el	código y	lanza	las	tareas	relacionadas
gulp.task('watch', function () {
    gulp.watch(['./app/**/*.html'], ['html']);
    gulp.watch(['./app/css/**/*.styl'], ['css', 'inject']);
    gulp.watch(['./app/js/**/*.js', './gulpfile.js'], ['jshint', 'inject']);
    gulp.watch(['./bower.json'], ['wiredep']);
});
gulp.task('default', ['server', 'inject', 'wiredep', 'watch']);