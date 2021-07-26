# Lbry SDK NodeJS

Original code was taken and adapted from:
- [adventurerlog/lbry-sdk-node](https://github.com/adventurerlog/lbry-sdk-node)
- [lbryio/electron-starter](https://github.com/lbryio/electron-starter)
- [lbryio/lbry-redux](https://github.com/lbryio/lbry-redux/blob/master/dist/bundle.es.js#L1014)

## Example Usage:

```javascript

const Lbry = require('lbry-sdk-nodejs/lib/sdk');

Lbry.Lbry.version()
.then(output => {
    console.log(output)
})

```
## Latest Api Sdk Version
[lbryio/lbry-sdk](https://github.com/lbryio/lbry-sdk) v0.101.0
