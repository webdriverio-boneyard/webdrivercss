#!/bin/bash

set -e

finish() {
  pkill -P $$ # kills all processes that have this pid - $$ - as the parent
  exit $STATUS
}

trap finish EXIT

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
PROJECT_DIR=$DIR/..
NODE_BIN=$PROJECT_DIR/node_modules/.bin
MOCHA_REPORTERS="spec"

# Runs selenium-server on travis
if [[ $TRAVIS == 'true' ]]; then
  curl -O http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar
  java -jar selenium-server-standalone-2.43.1.jar -host 127.0.0.1 -port 4444 2>/dev/null 1>/dev/null &
  # Wait for it
  while ! echo exit | nc localhost 4444; do sleep 1; done
else
  nc -zv 127.0.0.1 4444 > /dev/null
  if [[ $? -eq 1 ]]; then
    echo "Start selenium server before testing (selenium-standalone start)!"
    exit 1
  fi
fi

# Setup static site
cd $PROJECT_DIR/test/site && $NODE_BIN/bower install --config.interactive=false && cd $PROJECT_DIR
$NODE_BIN/http-server -p 8080 &

# Wait for http-server
while ! echo exit | nc localhost 8080; do sleep 1; done

# Setup coverage
if [[ $WEBDRIVERCSS_COVERAGE == '1' ]]; then
  MOCHA_REPORTERS="mocha-istanbul"
  $NODE_BIN/istanbul i lib -o lib-cov && \
    cp $PROJECT_DIR/lib/getPageInfo.js lib-cov && \
    cp $PROJECT_DIR/lib/makeScreenshot.js lib-cov && \
    cp $PROJECT_DIR/lib/documentScreenshot.js lib-cov && \
    cp $PROJECT_DIR/lib/viewportScreenshot.js lib-cov && \
    cp $PROJECT_DIR/lib/startSession.js lib-cov && \
    cp $PROJECT_DIR/lib/setScreenWidth.js lib-cov
fi

# Run tests
BLUEBIRD_LONG_STACK_TRACES=1 $NODE_BIN/_mocha -R $MOCHA_REPORTERS
STATUS=$?

# Echo coverage information
if [[ $WEBDRIVERCSS_COVERAGE == '1' ]]; then
  ./node_modules/coveralls/bin/coveralls.js < lcov.info
fi

exit $STATUS
