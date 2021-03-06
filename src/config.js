
import loadEntries from './entries/load'
import Uglify from 'uglifyjs-webpack-plugin'

export default (original) => {
  const {
    webpack: oWebpack,
    exportPathMap: oExportPathMap
  } = original

  return {
    ...original,
    webpack: function (...args) {
      const our = webpack(...args)
      let their

      if (oWebpack) {
        their = oWebpack(...args)
      }

      return {
        ...our,
        ...their
      }
    },
    exportPathMap: async function () {
      const our = await exportPathMap()
      let their
      if (oExportPathMap) {
        their = await oExportPathMap()
      }

      return {
        ...our,
        ...their
      }
    }
  }
}

export const webpack = (config, { dev }) => {
  config.node = {
    fs: 'empty'
  }

  config.plugins = config.plugins.filter(plugin => {
    return plugin.constructor.name !== 'UglifyJsPlugin'
  })

  if (!dev) {
    config.plugins.push(
      new Uglify({
        parallel: true,
        sourceMap: true
      })
    )
  }

  return config
}

export const exportPathMap = async () => {
  const entries = await loadEntries()
  const map = entries
    .reduce((prev, { data }) => {
      const { url, page, _entry } = data
      const query = _entry ? { _entry } : undefined
      return page ? {
        ...prev,
        [url]: { page: `/${page}`, query }
      } : prev
    }, {})

  return {
    '/': { page: '/' },
    ...map
  }
}
