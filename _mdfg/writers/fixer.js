
var http = require('http'),

log = function (mess) {

    console.log('*****');

    if (typeof mess === 'string') {

        console.log('fixer: ' + mess);

    } else {

        console.log(mess);

    }

},
request = function (done) {

    var req = http.request({

            host : 'api.fixer.io',
            method : 'GET',
            port : 80,
            path : '/latest'
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
exports.writer = function (arguObj,done) {

    request(function (data) {

        files = [];

        files.push({

            fileName : 'index',
            content : data

        });

        data = JSON.parse(data);

        Object.keys(data.rates).forEach(function (key) {

            files.push({

                fileName : 'fixer_' + key,
                content : data.rates[key]

            })

        });

        // all writers should spit back an object like this
        done(files);

    });

};
