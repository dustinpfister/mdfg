# MarkDown File Generator

Generates a collection of markdown files based on a writer script.


## Getting started

clone it in

```
$ git clone https://github.com/dustinpfister/mdfg
```

### install with -g

```
$ npm install -g
```

### cd to a working dir, and use the init argument to build a mdfg.json file

```
$ mdfg init
```

### build files

```
$ mdfg -b
```

## How to make a writer.

mdfg comes with some writers, however chances are you will want to write a few of your own. To do so you just need to have to write a module that has a single export method called "writer", that gives mdfg an array of objects that have fileNames, and the content of the file.

```js
exports.writer = function(arguObj, done){

    // all writers should spit back an array like this
    done([

        {

            fileName : 'test-file-one',
            content : '#This is test-file-one.md!'

        }, {

            fileName : 'test-file-two',
            content : '#This is test-file-two.md, woo hoo!'

        }

    ]);

};
```

## mdfg.json
