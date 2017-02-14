
var http = require('https'),

log = function (mess) {

    console.log('*****');

    if (typeof mess === 'string') {

        console.log('github_repos: ' + mess);

    } else {

        console.log('github_repos: ');
        console.log(mess);

    }

},
request = function (done) {

    var req = http.request({

            host : 'api.github.com',
            method : 'GET',
            //path : '/users/dustinpfister',
            path : '/users/dustinpfister/repos',
            headers : {
                'user-agent' : 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
            }
        },

            function (res) {

            // reject on bad status
            if (res.statusCode < 200 || res.statusCode >= 300) {

                log(new Error('statusCode=' + res.statusCode));
                done({});

            }
            // cumulate data
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            // resolve on end
            res.on('end', function () {

                done(body);

            });

        });

    req.on('error', function (err) {
        // This is not a "Second reject", just a different sort of failure
        log(err);
        done({});
    });

    req.end();

};

// export the MDFG writer!
exports.writer = function (arguObj, done) {

    log(arguObj);

    request(function (data) {

        files = [];

        files.push({

            fileName : 'index',
            content : data.toString('utf8')

        });

        // all writers should spit back an object like this
        done(files);

    });

};
