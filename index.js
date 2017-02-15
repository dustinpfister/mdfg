#!/usr/bin/env node

var mkdirp = require('mkdirp'),
fs = require('fs'),

// MDFG level options
options = {

    build : false,
    use : 'builtin', // use the build in writer
    writerPath : './_mdfg/writers',
    targetPath : './build',
    writerName : 'fixer',
    writerArguments : {}

},

// custom log method
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

// start the build process
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

buildJSON = function(){
	
	
	log('building using options from local mdfg.json...');
	
	fs.readFile('./mdfg.json', 'utf8',function(err,data){
		
		var mdfg_json;
		
		if(err){
			
			log('Error reading mdfg.json. Did you make it? Try $ mdfg init')
			log(err);
			
		}else{
		
			try{
				
				mdfg_json = JSON.parse(data);
				
				for(var prop in mdfg_json){
					
					options[prop] = mdfg_json[prop];
					
				}
				options.build = true;
				
				log(options);
				
				
			}catch(e){
				
				log('Error parsing mdfg.json, Try $ mdfg init');
				
				
			}
		
		}
		
	});
	
	
},

// init jason file
initJSON = function () {

    //var util = require('util');
    var keys = ['use', 'targetPath', 'writerName'],
    defaults = ['writer', './build', 'fixer'],
    forJSON = {},
    index = 0,

    done = function () {

        process.exit();
    },

    logCurrent = function () {

        log(keys[index] + '? : (' + defaults[index] + '):');

    };

    log('init new JSON file.');
    logCurrent();

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (text) {

        text = text.replace(/\r?\n|\r/g, '');

        if (text.length === 0) {

            forJSON[keys[index]] = defaults[index];

        } else {

            forJSON[keys[index]] = text;

        }

        // step index
        index += 1;

        if (index < keys.length) {

            logCurrent();

        } else {

            fs.writeFile('mdfg.json', JSON.stringify(forJSON) , 'utf8', function (err) {

                if (err) {

                    log('error writing JSON');
                    //log(err);
                    doen();

                } else {

                    log('done, built this json:');
                    log(JSON.stringify(forJSON));
                    done();

                }

            });

        }

    });

},

// process arguments
processArgv = function () {

    var argv = process.argv.splice(2, process.argv.length - 2),
    i = 0,
    obj,
    len = argv.length;

    if (argv.length <= 1) {

        if (argv.length === 0) {

            log('must give arguments');

        } else {

            if (argv[0] === 'init') {

                initJSON();

            }

            if (argv[0] === '-json') {

                buildJSON();

            }

        }

    } else {
        while (i < len) {

            if (argv[i] === '-b' || argv[i] === '-build') {

                options.build = true;

            }

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

            i += 1;

        }

    }

    if (options.build) {

        build();

    }

};

// process given arguments
processArgv();
