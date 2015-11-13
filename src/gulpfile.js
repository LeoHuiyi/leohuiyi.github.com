var gulp = require('gulp');
var webpack = require('gulp-webpack');

gulp.task('webpack', function() {
    return gulp.src('../src')
        .pipe(webpack(require('./webpack.config.js')));
});

gulp.task('watch', function () {
    gulp.watch('../src/index.html', ['webpack']);
});
