//	File:	gulpfile.js
'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    inject = require('gulp-inject'),
    wiredep = require('wiredep').stream,
    templateCache = require('gulp-angular-templatecache'),
    gulpif = require('gulp-if'),
    minifyCss = require('gulp-minify-css'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    uncss = require('gulp-uncss'),
    htmlmin = require('gulp-htmlmin');

//	Servidor	web	de	desarrollo
gulp.task('server', function () {
    connect.server({
        root: './app',
        hostname: '0.0.0.0',
        port: 8080,
        livereload: true
    });
});

gulp.task('server-dist', function () {
    connect.server({
        root: './dist',
        hostname: '0.0.0.0',
        port: 8080,
        livereload: true
    });
});

//	Busca	errores	en	el	JS	y	nos	los	muestra	por	pantalla
gulp.task('jshint', function () {
    return gulp.src(['./app/js/**/*.js', '!./app/js/templates.js']).pipe(jshint('.jshintrc'))
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
        .pipe(wiredep({
            directory: './app/lib'
        }))
        .pipe(gulp.dest('./app'))
        .pipe(inject(sources, {
            read: false,
            ignorePath: '/app'
        }))
        .pipe(gulp.dest('./app'));
});

gulp.task('templates', function (done) {
    gulp.src('./app/templates/**/*.html')
        .pipe(templateCache({
            root: '/templates/',
            module: 'app.templates',
            standalone: true
        }))
        .pipe(gulp.dest('./app/js'))
        .on('end', done);
});

gulp.task('compress', function (done) {
    gulp.src('./app/index.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify({mangle: false, compress: true})))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('./dist'))
        .on('end', done);
});

gulp.task('htmlcompress', function (done) {
    gulp.src('./dist/*.html')
        .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest('./dist'))
        .on('end', done);
});

gulp.task('copy', function (done) {
    gulp.src('./app/lib/font-awesome/fonts/**')
        .pipe(gulp.dest('./dist/fonts'));
    gulp.src('./app/img/**')
        .pipe(gulp.dest('./dist/img'))
        .on('end', done);
});

gulp.task('uncss', function () {
    gulp.src('./dist/css/style.min.css')
        .pipe(uncss({
            html: ['./app/index.html', './app/templates/blog.html', './app/templates/home.html', './app/templates/page.html', './app/templates/single.html', './app/templates/projects.html', './app/templates/project_detail.html']
        }))
        .pipe(gulp.dest('./dist/css'));
});


//	Vigila	cambios	que	se	produzcan	en	el	código y	lanza	las	tareas	relacionadas
gulp.task('watch', function () {
    gulp.watch(['./app/**/*.html'], ['html', 'templates']);
    gulp.watch(['./app/css/**/*.styl'], ['css', 'inject']);
    gulp.watch(['./app/js/**/*.js', './gulpfile.js', './bower.js'], ['inject']);
});

gulp.task('default', ['server', 'inject', 'watch']);
gulp.task('dist', ['server-dist', 'inject', 'watch']);
gulp.task('build', ['templates', 'compress', 'copy']);