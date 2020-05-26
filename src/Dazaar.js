'use strict'

const Payment = require('dazaar-payment-lightning')
const hypercore = require('hypercore')
const swarm = require('dazaar/swarm')
const market = require('dazaar/market')
const { EventEmitter } = require('events')
const buffEncode = require('./BuffEncode')

class Dazaar extends EventEmitter {
  constructor (config) {
    super()
    this.config = config
    this.market = market('./test-data')
    this.feed = hypercore('./tmp/data')
  }

  start () {
    const self = this
    this.seller = this.market.sell(this.feed, {
      validate (remoteKey, cb) {
        self.ln.validate(remoteKey, (err, data) => {
          cb(err, data)
        })
      }
    })
    this.seller.on('ready', (err) => {
      if (err) throw err
      this.ln = new Payment(this.seller, this.config.stream_price, this.config)
    })

    swarm(this.seller, () => {
      this.station_key = this.seller.key.toString('hex')
      this.emit('station-key', this.station_key)
    })
  }

  appendFeed (meta, media) {
    const buff = buffEncode.encode({ meta, media })
    this.feed.append(buff)
  }
}

module.exports = Dazaar
