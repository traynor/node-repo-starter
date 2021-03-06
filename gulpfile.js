// Gulpfile.js
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const Cache = require('gulp-file-cache');
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');

const cache = new Cache();

const src = './src/**/*.js';
const dest = 'lib';
const example = 'example';

gulp.task('lint', function(){
    return gulp.src([src, example])
        .pipe(eslint())
        .pipe(eslint.format());
});


gulp.task('compile', ['lint'], function() {
    let stream = gulp.src(src) // your ES2015 code
        .pipe(sourcemaps.init())
        //.pipe(cache.filter()) // remember files
        .pipe(babel({
                    "presets": ["env"]
                })) // compile new ones
        .pipe(sourcemaps.write('.', {
            includeContent: false,
            sourceRoot: '../src'
        }))
        //.pipe(cache.cache()) // cache them
        .pipe(gulp.dest(dest)) // write them
    return stream // important for gulp-nodemon to wait for completion
});

gulp.task('test', ['compile'], function() {
    let stream = gulp.src([dest])
        .pipe(mocha({
            reporter: 'list'
        }))
        .once('error', (err) => {
            process.exit(1);
        })
        //.once('end', () => {
        //    process.exit();
        //});
    return stream
});

gulp.task('watch', ['test'], function() {
    let stream = nodemon({
            script: 'example', // run ES5 code
            watch: ['src', 'test'], // watch ES2015 code
            tasks: ['test'] // compile synchronously onChange
        })
        .on('restart', function() {
            /* eslint-disable no-console */
            console.log('nodemon restarted');
            /* eslint-enable no-console */
        })
        .on('start', function() {
            /* eslint-disable no-console */
            console.log('nodemon started');
            /* eslint-enable no-console */
        })
        .on('crash', function() {
            /* eslint-disable no-console */
            console.error('nodemon crashed!\n');
            /* eslint-enable no-console */
            // emitting causes to run task, crashes nodemon
            //stream.emit('restart', 10) // restart the server in 10 seconds
        });

    return stream;
});

gulp.task('default', ['watch']);
