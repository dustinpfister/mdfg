#!/usr/bin/env node

var mkdirp = require('mkdirp'),
fs = require('fs'),

options = {

    use : 'builtin', // use the build in writer
    writerPath : './_mdfg/writers',
    targetPath : './build',
    writerName : 'fixer',
    writerArguments : {}

},

log = function (mess) {

    console.log('*****');

    if (typeof mess === 'string') {

        console.log('mdfg: ' + mess);

    } else {

        console.log('mdfg (non string): ');
        console.log(mess);

    }

},

// a built in markdown writer
builtIn = function (arguObj, done) {

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
    writer(options.writerArguments, function (data) {

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
    writer(options.writerArguments, function (data) {

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

            //log('error writing md file: ' + name + '.md');
            //log(err);
            fail();

        }

        //log(' write file: ' + name + '.md');

        done();

    });

},

build = function () {

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

},

processArgv = function () {

    var argv = process.argv.splice(2, process.argv.length - 2),
    i = 0,
    obj,
    len = argv.length;

    if (argv.length <= 1) {

        log('init!');

    } else {

        while (i < len) {

            // are we using a writer script?
            if (argv[i] === '-w') {

                options.use = 'writer';
                options.writerName = argv[i + 1] || options.writerName;

            }

            if (argv[i] === '-a') {

                options.writerArguments = {};

                // we should have a propname:value; string
                if (argv[i + 1]) {

                    obj = argv[i + 1].split(';');

                    obj.forEach(function (prop) {

                        prop = prop.split(':')

                            options.writerArguments[prop[0]] = prop[1];

                    });

                }

            }

            i += 2;

        }

        build();

    }

};

// process given arguments
processArgv();
