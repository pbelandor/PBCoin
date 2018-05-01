var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'})


var ipfsPath = "/ipfs/QmT7uHVkJ4kMuZH87kgHBfqguBwTakhA6weSizNqXoj2N2"

ipfs.files.cat(ipfsPath, function (err, file) {
  if (err) {
    throw err
  }

  console.log(file.toString('utf8'))
})

const files = [
  {
    path: '/tmp/myfile.txt',
    content: "Hi"
  }
]

ipfs.files.add(files, function (err, files) {
  // 'files' will be an array of objects containing paths and the multihashes of the files added
})
