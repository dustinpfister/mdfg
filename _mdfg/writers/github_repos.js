
var http = require('https'),
os = require('os'),

log = function (mess) {

    console.log('*****');

    if (typeof mess === 'string') {

        console.log('github_repos: ' + mess);

    } else {

        console.log('github_repos: ');
        console.log(mess);

    }

},
request = function (arguObj, done) {

    var req = http.request({

            host : 'api.github.com',
            method : 'GET',
            path : '/users/' + arguObj.user + '/repos',
            headers : {
                'user-agent' : 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
            }
        },

            function (res) {

            // reject on bad status
            if (res.statusCode < 200 || res.statusCode >= 300) {

                //log(new Error('statusCode=' + res.statusCode));
                done({});

            }
            // cumulate data
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            // resolve on end
            res.on('end', function () {

                done(Buffer.concat(body).toString());

            });

        });

    req.on('error', function (err) {
        // This is not a "Second reject", just a different sort of failure
        //log(err);
        done({});
    });

    req.end();

},

// build the index file
buildIndex = function (arguObj, data) {

    var text = '#Github Projects for user : ' + arguObj.user + os.EOL;
    text += 'This file was generated with [mdfg](https://github.com/dustinpfister/mdfg) by Dustin Pfister (GPL-3.0)' + os.EOL + os.EOL;

    data = JSON.parse(data);

    data.forEach(function (repo) {

        text += '##[' + repo.name + '](/github/' + repo.name + '.html)' + os.EOL;
        text += os.EOL;
        text += repo.description + os.EOL;
        text += os.EOL;
        text += os.EOL;

    });

    return text;

};

// export the MDFG writer!
exports.writer = function (arguObj, done) {

    request(arguObj, function (data) {

        files = [];

        files.push({

            fileName : 'index',
            content : buildIndex(arguObj, data)

        });

        // all writers should spit back an object like this
        done(files);

    });

};
