'use strict'

const fs = require('fs')
const { EventEmitter } = require('events')
const Tail = require('tail').Tail

class HLSEncoder extends EventEmitter {
  constructor (config) {
    super()
    this.config = config
    this.config.PLAYLIST_PATH = this.config.PLAYLIST_PATH || './.playlist'
    this.config.PLAYLIST_FILE = this.config.PLAYLIST_FILE || 'output.m3u8'
    this.PLAYLIST_FILE = `${this.config.PLAYLIST_PATH}/${this.config.PLAYLIST_FILE}`
    this.SEG_REGX = /(output)(\d*).(ts)/g
    this.EXTINF_REGEX = /(#EXTINF:)(\d*.\d*),/
  }

  start () {
    const tail = new Tail(this.PLAYLIST_FILE, {
      useWatchFile: true
    })
    this.init = false

    let currentExt = ''
    tail.on('line', (data) => {
      const line = data.toString()
      const segment = this.SEG_REGX.exec(line)
      const extinf = this.EXTINF_REGEX.exec(line)
      if (extinf) {
        currentExt = line
        return
      }
      if (segment) {
        return this.newSegment({
          name: line,
          extinf: currentExt,
          number: segment[2]
        })
      }
    })
    tail.on('error', function (error) {
      throw error
    })
    tail.watch()
  }

  newSegment (arg) {
    if (!this.init) {
      this.init = true
      return
    }
    this.emit('new-segment', arg)
    const file = fs.ReadStream(this.config.PLAYLIST_PATH + '/' + arg.name)
    file.on('data', (data) => {
      this.emit('segment-data', {
        data, name: arg.name, number: arg.number, extinf: arg.extinf
      })
    })
    file.on('end', () => {
      this.emit('segment-end', { name: arg.name, number: arg.number })
    })
  }
}

module.exports = HLSEncoder
