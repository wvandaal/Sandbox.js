var gulp    = require('gulp'),
    jshint  = require('gulp-jshint'),
    sass    = require('gulp-sass');

// Lint Task
gulp.task('lint', function() {
    return gulp.src(['src/*/*.js', 'src/options/js/options.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish-ex'));
});

// Compile Sass
gulp.task('sass', function() {
    return gulp.src('src/options/styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('src/options/styles'));
});

gulp.task('watch', function() {
    gulp.watch(['src/*/*.js', 'src/options/js/options.js'], ['lint']);
    gulp.watch('src/options/styles/*.scss', ['sass']);
});

gulp.task('default', ['lint', 'sass', 'watch']);