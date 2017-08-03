var config
var sites

function loadConfig () {
  config = localStorage.getItem('config')
  if (!config) {
    config = {bundlerPath: 'bundle', jekyllPath: 'jekyll'}
  } else {
    config = JSON.parse(config)
    if (config.bundlerPath.length === 0) {
      config.bundlerPath = 'bundle'
    }
    if (config.jekyllPath.length === 0) {
      config.jekyllPath = 'jekyll'
    }
  }
  $('#bundlerPath').val(config.bundlerPath)
  $('#jekyllPath').val(config.jekyllPath)
}

loadConfig()

function loadSites () {
  sites = localStorage.getItem('sites')
  if (!sites) {
    sites = []
  } else {
    sites = JSON.parse(sites)
  }
}

loadSites()

function storeSites (sitesToSave) {
  sitesToSave.forEach(function (site) {
    site.active = false
    site.status = 'stopped'
    site.runner = null
    site.console = []
  })
  localStorage.setItem('sites', JSON.stringify(sitesToSave))
}
