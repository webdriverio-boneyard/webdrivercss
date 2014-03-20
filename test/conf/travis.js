module.exports = {
    port: 4445,
    desiredCapabilities : {
        browserName: (process.env._BROWSER || '').replace(/_/g,' '),
        platform: (process.env._PLATFORM || '').replace(/_/g,' '),
        version: process.env._VERSION,
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'idle-timeout': 900,
        tags: ['webdriverjs','api','test'],
        name: 'webdriverjs API test',
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
    }
};