var gulp = require('gulp');
var stylus = require('gulp-stylus');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

var path = {
    stylus: ['stylus/**/*.styl'],
    css: 'css/',
    coffee: ['coffee/**/*.coffee'],
    js: 'js/',
    dist:'dist/js/'
};

gulp.task('stylus', function () {
    return gulp.src(path.stylus)
        .pipe(stylus({
            compress: true
        }))
        .pipe(gulp.dest(path.css));
});

gulp.task('coffee', function () {
    gulp.src(path.coffee)
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(gulp.dest(path.js))
});

gulp.task('minify', function () {
    gulp.src(path.js + '*.js')
        .pipe(uglify())
        .pipe(gulp.dest(path.dist));
});

gulp.task('watch', function () {
    gulp.watch(path.stylus, ['stylus']);
    gulp.watch(path.coffee, ['coffee']);
    gulp.watch(path.minify, ['minify'])
});


gulp.task('default', ['stylus', 'coffee', 'minify', 'watch']);
