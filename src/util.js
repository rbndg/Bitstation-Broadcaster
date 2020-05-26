'use strict'

const util = {}
const { EventEmitter } = require('events')
const fs = require('fs')

util.File = class File extends EventEmitter {
  constructor (config) {
    super()
    this.config = config
  }

  start () {
    const file = fs.createReadStream(this.config.mediaFile)
    file.on('open', () => {
      this.emit('media-request', file)
    })

    file.on('end', () => {
      this.emit('media-end')
    })
  }
}

module.exports = util
