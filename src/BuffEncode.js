const protobuf = require('protocol-buffers')
const { readFileSync } = require('fs')
const { RadStream } = protobuf(readFileSync('./src/bs.proto'))

module.exports = {
  encode: ({ meta, media }) => {
    const obj = { meta, media }
    if (!meta) {
      obj.meta = null
    }
    if (!media) {
      obj.media = null
    }
    return RadStream.encode(obj)
  },
  decode: (d) => {
    return RadStream.decode(d)
  }
}
