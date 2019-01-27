Minimal repro for https://github.com/redux-saga/redux-saga/issues/1743


```shell
$ git clone https://github.com/dorian-marchal/redux-saga-issue-1743
Cloning into 'redux-saga-issue-1743'...

$ cd redux-saga-issue-1743/

$ node -v
v10.14.1

$ npm install

$ cat node_modules/redux-saga/package.json | grep '"version":'
  "version": "0.16.2"

$ node -r esm index.js
OK

$ npm i redux-saga@latest

$ cat node_modules/redux-saga/package.json | grep '"version":'
  "version": "1.0.0"

$ node -r esm index.js
ERROR:
    Expected state: {"pingCount":2,"pongCount":2},
    Current state:  {"pingCount":2,"pongCount":1}
```
