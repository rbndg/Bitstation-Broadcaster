'use strict'

const { EventEmitter } = require('events')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const rimraf = require('rimraf')

module.exports = class HLS extends EventEmitter {
  constructor (config) {
    super()
    this.config = config
    this.config.PLAYLIST_PATH = this.config.PLAYLIST_PATH || './.playlist'
    this.config.PLAYLIST_FILE = this.config.PLAYLIST_FILE || 'output.m3u8'
    this.PLAYLIST_FILE = `${this.config.PLAYLIST_PATH}/${this.config.PLAYLIST_FILE}`
    this.currentEncoder = null
  }

  init (cb) {
    rimraf(this.config.PLAYLIST_PATH, (err, data) => {
      if (err) return cb(err)
      fs.mkdir(this.config.PLAYLIST_PATH, (err) => {
        if (err) return cb(err)
        fs.openSync(this.PLAYLIST_FILE, 'w')
        cb()
      })
    })
  }

  kill () {
    if (this.currentEncoder) {
      this.currentEncoder.kill()
    }
  }

  createPlaylist (readStream) {
    if (this.currentEncoder) {
      this.currentEncoder.once('error', () => {
        this.currentEncoder = null
        this.createPlaylist(readStream)
      })
      this.currentEncoder.kill()
      return
    }

    if (this.config.rtmp) {
      this.currentEncoder = ffmpeg(this.config.rtmp, { timeout: 432000 })
        .addInputOption(['-listen 1', '-f flv'])
    } else if (readStream) {
      this.currentEncoder = ffmpeg(readStream)
    } else {
      throw new Error('No input provided')
    }

    const FRAME_SIZE = 3

    this.currentEncoder.addOptions([
      '-c:v h264',
      '-hls_init_time 1',
      '-hls_time 1',
      '-hls_list_size 100',
      '-force_key_frames expr:gte(t,n_forced*' + FRAME_SIZE + ')'
    ]).output(this.PLAYLIST_FILE)

    this.currentEncoder.on('progress', (data) => {
      this.emit('encoder-progress', data)
    })
    this.currentEncoder.on('start', () => {
      this.emit('start')
    }).on('end', function (stdout, stderr) {
      this.emit('end')
    }).on('error', (err) => {
      this.emit('error', err)
      this.currentEncoder = null
    })
    this.currentEncoder.run()
    process
      .on('unhandledRejection', this.kill.bind(this))
      .on('uncaughtException', this.kill.bind(this))
      .on('exit', this.kill.bind(this))
      .on('beforeExit', this.kill.bind(this))
  }
}
