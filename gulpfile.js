var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('serve-dev', function() {
  browserSync({
    server: {
      baseDir: '.'
    }
  });

  gulp.watch(['*.html', 'scripts/**/*.js'], reload);
});
