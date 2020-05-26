'use strict'
const Dazaar = require('./src/Dazaar')
const Render = require('./src/Render')
const { File } = require('./src/util')
const HLSEncoder = require('./src/HLSEncoder')
const HLS = require('./src/HLS')

const config = require('./config.json')

const start = (flag, filePath) => {
  // # HLS Converter: Convert a given input to HLS playlist
  const hls = new HLS(config)
  hls.on('end', () => {
    render.setState({
      inputStream: 'Input stream has ended'
    })
  })
  hls.init(() => {
    hs.start()
  })

  // # HLS Encoder: Convert HLS segments into ingest
  const hs = new HLSEncoder({
    PLAYLIST_FILE: 'output.m3u8',
    PLAYLIST_PATH: './.playlist'
  })

  hs.on('segment-data', (data) => {
    dazaar.appendFeed({
      seg_number: data.number,
      extinf: data.extinf
    }, data.data)
  })

  let media
  let inputType
  if (flag === 'file') {
    config.mediaFile = filePath
    media = new File(config)
    inputType = config.mediaFile
  } else {
    inputType = config.rtmp
  }

  // # CLI View
  const render = new Render({
    state: {},
    config: {}
  })
  render.forceRender()
  render.toggleLoading()

  // # Dazaar instance
  const dazaar = new Dazaar(config)
  dazaar.on('loading', (str) => {
    render.toggleLoading()
  })

  dazaar.on('station-key', (stationKey) => {
    render.toggleLoading()
    render.setState({
      stationKey,
      inputStream: inputType
    })

    if (flag === 'file') {
      media.on('media=request', (file) => {
        hls.createPlaylist(file)
      })
      media.start()
    } else {
      hls.createPlaylist()
    }
  })

  dazaar.start()
}

const flag = process.argv[2]
let a
if (flag === '-r') {
  a = 'rtmp'
} else if (flag === '-f') {
  a = 'file'
} else {
  console.log(`
    Arguments: 
      -f <file path>  : Broadcast a file
      -r              : Broadcast from RTMP 
  `)
  process.exit(1)
}

start(a, process.argv[3])
