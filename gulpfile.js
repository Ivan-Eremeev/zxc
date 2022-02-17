// * Команды *
// "gulp" - запуск gulp.
// "gulp mg" - группировка всех медиазапросов в конец файла style.css.
// "gulp min" - сжимает js, css (создает минимизированные файлы script.min.js и style.min.css).
// "gulp img-min" - сжимает изображения
// "gulp webp" - конвертирует изображения jpeg, jpg, png в формат webp

// * Настройки *
const preprocessor = 'scss', // Выбрать препроцессор для стилей (scss или less)
  jsOn = false, // Нужно ли собирать js (инклюды файлов)
  html = false; // Нужно ли делать перезагрузку браузера при изменении html файлов (если не используется pug)

// * Пути к папкам относительно корня проекта *
const scssPath = 'scss', // Scss
  lessPath = 'less', // Less
  cssPath = 'dist/css', // Css
  pugPath = 'pug', // Pug
  htmlPath = 'dist', // Html
  jsAppPath = 'js-app', // Js до сборки
  jsPath = 'dist/js', // Js после сборки
  imgPath = 'dist/img'; // Изображения



// Код
const gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass')),
  less = require('gulp-less'),
  concatJS = require('gulp-concat'),
  pug = require('gulp-pug'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  rigger = require('gulp-rigger'),
  browserSync = require('browser-sync'),
  uglify = require('gulp-uglify'),
  rename = require("gulp-rename"),
  gcmq = require('gulp-group-css-media-queries'),
  imageMin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  plumber = require('gulp-plumber'),
  webp = require('gulp-webp');

gulp.task('pug', function () {
  return gulp.src(pugPath + '/*.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: '\t'
    }))
    .pipe(gulp.dest(htmlPath))
    .pipe(browserSync.reload({ stream: true }));
});

if (preprocessor == 'scss') {
  gulp.task('style', function () {
    return gulp.src(scssPath + '/style.scss')
      .pipe(plumber())
      .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
      .pipe(autoprefixer({
        cascade: false
      }))
      .pipe(gulp.dest(cssPath))
      .pipe(browserSync.reload({ stream: true }));
  });
}

else if (preprocessor == 'less') {
  gulp.task('style', function () {
    return gulp.src(lessPath + '/style.less')
      .pipe(plumber())
      .pipe(less())
      .pipe(autoprefixer({
        cascade: false
      }))
      .pipe(gulp.dest(cssPath))
      .pipe(browserSync.reload({ stream: true }));
  });
}

gulp.task('js', function () {
  if (jsOn) {
    return gulp.src(jsAppPath + '/scripts.js')
      .pipe(rigger())
      .pipe(gulp.dest(jsPath))
      .pipe(browserSync.reload({ stream: true }));
  }
});

gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: htmlPath
    },
    notify: true
  });
});

gulp.task('css-min', function () {
  return gulp.src(cssPath + '/style.css')
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('js-min', function () {
  return gulp.src(jsPath + '/scripts.js')
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(jsPath))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('img-min', function () {
  return gulp.src(imgPath + '/**/*')
    .pipe(gulp.dest(imgPath + '-full'))
    .pipe(imageMin([
      imageMin.gifsicle(),
      imageMin.mozjpeg(),
      imageMin.svgo(),
      pngquant()
    ], {
      verbose: true
    }))
    .pipe(gulp.dest(imgPath));
});

gulp.task('mg', function () {
  return gulp.src(cssPath + '/style.css')
    .pipe(gcmq())
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.reload({ stream: true }));
});


gulp.task('watch', function () {
  gulp.watch(pugPath + '/**/*.pug', gulp.parallel('pug'));
  if (html) {
    gulp.watch(htmlPath + '/**/*.html', function reload(done) {
      browserSync.reload();
      done();
    });
  }
  if (jsOn) {
    gulp.watch(jsAppPath + '/**/*.js', gulp.parallel('js'));
  } else {
    gulp.watch(jsPath + '/**/*.js', function reload(done) {
      browserSync.reload();
      done();
    });
  }
  gulp.watch(scssPath + '/**/*.scss', gulp.parallel('style'));
  gulp.watch(lessPath + '/**/*.less', gulp.parallel('style'));
});

gulp.task('webp', () =>
  gulp.src(imgPath + '/**/*.+(jpg|png|jpeg)')
    .pipe(webp())
    .pipe(gulp.dest(imgPath))
);

gulp.task('default', gulp.parallel('browser-sync', 'pug', 'js', 'style', 'watch'));

gulp.task('min', gulp.parallel('css-min', 'js-min'));