var gulp        = require('gulp'),
    $           = require('gulp-load-plugins')(),
    path        = require('path'),
    browserSync = require('browser-sync'),
    through2    = require('through2'),
    reload      = browserSync.reload,
    browserify  = require('browserify'),
    del         = require('del'),
    argv        = require('yargs').argv,
    coffeeify   = require('coffeeify'),
    sass        = require('gulp-sass');

gulp.task('browser-sync', function() {
  browserSync({
    open: !!argv.open,
    notify: !!argv.notify,
    server: {
      baseDir: "./dist"
    }
  });
});

gulp.task('sass', function () {
  gulp.src('src/stylesheets/*.{scss,sass}')
    .pipe(sass({
      includePaths: ['src/bower_components']
     }).on('error', sass.logError))
    .pipe(gulp.dest('dist/stylesheets/'));
});

gulp.task('js', function() {
  return gulp.src('src/scripts/*.coffee')
    .pipe($.plumber())
    .pipe(through2.obj(function (file, enc, next) {
      browserify(file.path, { debug: true })
        .transform(require('coffeeify'))
        .transform(require('debowerify'))
        .bundle(function (err, res) {
          if (err) { return next(err); }
          file.contents = res;
            next(null, file);
        });
      }))
      .on('error', function (error) {
        console.log(error.stack);
        this.emit('end')
    })
  .pipe( $.rename('app.js'))
  .pipe( gulp.dest('dist/scripts/'));
});


gulp.task('clean', function(cb) {
  del('./dist', cb);
});

gulp.task('images', function() {
  return gulp.src('./src/images/**/*')
    .pipe($.imagemin({
      progressive: true
    }))
    .pipe(gulp.dest('./dist/images'))
})
<% if (templateOption=='jade') { %>
gulp.task('templates', function() {
  return gulp.src('src/*.jade')
    .pipe($.plumber())
    .pipe($.jade({
      pretty: true
    }))
    .pipe( gulp.dest('dist/') )
});
<% }else{ %>
gulp.task('templates', function() {
  return gulp.src('src/**/*.html')
    .pipe($.plumber())
    .pipe( gulp.dest('dist/') )
});
<% } %>


gulp.task('build', ['js', 'templates', 'images', 'sass']);

gulp.task('serve', ['build', 'browser-sync'], function () {
  gulp.watch('src/stylesheets/**/*.{scss,sass}',['sass', reload]);
  gulp.watch('src/scripts/**/*.coffee',['js', reload]);
  gulp.watch('src/images/**/*',['images', reload]);<% if (templateOption=='jade') { %>
  gulp.watch('src/*.jade',['templates', reload]);<% }else{ %>
  gulp.watch('src/*.html',['templates', reload]);<% } %>
});

gulp.task('default', ['serve']);
