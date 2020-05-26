'use strict'
const chalk = require('chalk')
const DiffyView = require('diffy-view')

const frames = {
  loading: ['◢', '◣', '◤', '◥']
}
module.exports = class View extends DiffyView {
  toggleLoading () {
    if (this.isLoading) {
      clearInterval(this._loader)
      this.setState({
        loading: ''
      })
      this.isLoading = false
      return
    }
    const str = 'Loading'
    this.isLoading = true
    const frm = frames.loading
    let _x = 0
    this._loader = setInterval(() => {
      this.setState({
        loading: chalk.red(frm[_x] + ' ' + str)
      })
      if (_x < (frm.length - 1)) {
        _x++
      } else {
        _x = 0
      }
    }, 250)
  }

  render () {
    const { loading, stationKey, inputStream } = this.state
    return `
      ${chalk.cyan('Bitstation')}
      ${loading || ''}
      ${stationKey ? `Station Key: ${chalk.underline.blue.bold(stationKey)}` : ''}

      ${inputStream ? `Media: ${chalk.green(inputStream)}` : ''}

    `
  }
}
