#!/usr/bin/env node

var mkdirp = require('mkdirp'),
fs = require('fs'),
//writersPath = './_mdfg/writers', // where to look for writers
//buildPath = './build', // the path to build markdown files at


options = {

    use : 'builtin', // use the build in writer
    writerPath : './_mdfg/writers',
    targetPath : './build',
    writerName : 'github_repos',

},

log = function (mess) {

    console.log('*****');

    if (typeof mess === 'string') {

        console.log('mdfg: ' + mess);

    } else {

        console.log(mess);

    }

},

// a built in markdown writer
builtIn = function (done) {

    log('using built in markdown writer...');

    // all writers should spit back an object like this
    done([{

                fileName : 'test-file-one',
                content : 'this is test file ones data'

            }, {

                fileName : 'test-file-two',
                content : 'this is test file two, woo hoo!'

            }

        ]);

},

// build files one at a time
buildFiles_sync = function (writer) {

    writer = writer || builtIn;

    // call the writer, and build it's data
    writer(function (data) {

        var i = 0,
        fileCount = data.length;

        buildNext = function () {

            if (i < fileCount) {

                writeFile(data[i].fileName, data[i].content, function () {

                    i += 1;

                    buildNext();

                });

            }

        };

        buildNext();

    });

},

// build files in async order
buildFiles_async = function (writer) {

    writer = writer || builtIn;

    // call the writer, and build it's data
    writer(function (data) {

        var fileCount = data.length,
        i = 0;
        while (i < fileCount) {

            writeFile(data[i].fileName, data[i].content);

            i += 1;
        }

    });

},

// write a markdown file
writeFile = function (name, data, done, fail) {

    done = done || function () {};
    fail = done || function () {};

    fs.writeFile(options.targetPath + '/' + name + '.md', data, 'utf8', function (err) {

        if (err) {

            log('error writing md file: ' + name + '.md');
            log(err);
            fail();

        }

        log(' write file: ' + name + '.md');

        done();

    });

},

processArgv = function () {

    var argv = process.argv.splice(2, process.argv.length - 2);

    log(argv);

};

// process given arguments
processArgv();

// make the build path, and write markdown files
mkdirp(options.targetPath, function (err) {

    var writer = builtIn;

    if (err) {

        log('Error making build path:');
        log(err);

    } else {

        log('build folder ready');

        //buildFiles_async();
        //buildFiles_sync(require(options.writersPath + '/fixer.js').writer);

        // what to use to build
        switch (options.use) {

        case 'builtin':

            writer = builtIn;

            break;

        case 'writer':

            writer = require(options.writerPath + '/' + options.writerName + '.js').writer

                break;

        }

        buildFiles_sync(writer);

    }

});
