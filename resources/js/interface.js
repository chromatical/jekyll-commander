var app = new Vue({
  el: '#app',
  data: {
    sites: sites
  },
  methods: {
    setActive: function (siteToSetActive) {
      // Set previously selected site inactive
      app.sites.forEach(function (site) {
        site.active = false
      })
      siteToSetActive.active = true
    },
    startServer: function (siteToStartServer) {
      siteToStartServer.status = 'running'
      siteToStartServer.runner = execFile(config.bundlerPath, ['exec', config.jekyllPath, 'serve', '--port', siteToStartServer.port], {cwd: siteToStartServer.path, env: process.env}, function (error, stdout, stderr) {
        if (error) {
          if (error.code === 'ENOENT') {
            jekyllNotFound()
            siteToStartServer.status = 'error'
          }
        }
      })
      siteToStartServer.runner.stdout.on('data', function (data) {
        siteToStartServer.console.push(data)
      })
      siteToStartServer.runner.stderr.on('data', function (data) {
        siteToStartServer.console.push(data)
      })
      siteToStartServer.runner.on('exit', function (code) {
        if (siteToStartServer.status !== 'stopped') {
          if (code !== 0) {
            Messenger().post({
              message: 'An error occurred starting the server for <i>' + siteToStartServer.name + '</i>.  See the message console for details.',
              showCloseButton: true,
              type: 'error'
            })
            siteToStartServer.status = 'error'
          }
        }
      })
    },
    stopServer: function (siteToStopServer) {
      siteToStopServer.status = 'stopped'
      siteToStopServer.runner.kill()
    },
    launchBrowser: function (siteToLaunchBrowser) {
      shell.openExternal('http://localhost:' + siteToLaunchBrowser.port)
    },
    openFolder: function (siteToOpenFolder) {
      shell.openItem(siteToOpenFolder.path)
    },
    buildChanges: function (siteToBuildChanges) {
      Messenger().post({
        message: 'Building changes for <i>' + siteToBuildChanges.name + '</i>.',
        showCloseButton: true,
        type: 'info'
      })
      siteToBuildChanges.status = 'building'
      siteToBuildChanges.runner = execFile(config.bundlerPath, ['exec', config.jekyllPath, 'build'], {cwd: siteToBuildChanges.path, env: process.env}, function (error, stdout, stderr) {
        if (error) {
          if (error.code === 'ENOENT') {
            jekyllNotFound()
            siteToBuildChanges.status = 'error'
          }
        }
      })
      siteToBuildChanges.runner.stdout.on('data', function (data) {
        siteToBuildChanges.console.push(data)
      })
      siteToBuildChanges.runner.stderr.on('data', function (data) {
        siteToBuildChanges.console.push(data)
      })
      siteToBuildChanges.runner.on('exit', function (code) {
        siteToBuildChanges.status = 'stopped'
        if (code !== 0) {
          siteToBuildChanges.status = 'error'
          Messenger().post({
            message: 'An error occurred building the changes for <i>' + siteToBuildChanges.name + '</i>.  See the message console for details.',
            showCloseButton: true,
            type: 'error'
          })
        } else {
          Messenger().post({
            message: 'Done building changes for <i>' + siteToBuildChanges.name + '</i>.',
            showCloseButton: true,
            type: 'success'
          })
        }
      })
    },
    exportZip: function (siteToExport) {
      savePath = dialog.showSaveDialog({filters: [{name: 'Compressed Zip', extensions: ['zip']}]})
      if (savePath) {
        createArchive(siteToExport, savePath)
      }
    },
    removeActiveSite: function () {
      app.sites.forEach(function (site) {
        if (site.active) {
          if (site.runner) {
            site.status = 'stopped'
            site.runner.kill()
          }
          app.sites.splice(app.sites.indexOf(site), 1)
        }
      })
    }
  },
  computed: {
    isSiteActive: function () {
      // Returns true when there is a site selected
      var active = false
      this.sites.forEach(function (site) {
        if (site.active) {
          active = true
        }
      })
      return active
    }
  }
})

$('#newSite').on('click', function () {
  $('#newSiteModal').modal({
    closable: false,
    onHidden: function () {
      $('#newSiteModal form').trigger('reset')
    }
  }).modal('show')
})

$('#editConfig').on('click', function () {
  $('#editConfigModal').modal({
    closable: false,
    onApprove: function () {
      localStorage.setItem('config', JSON.stringify({
        bundlerPath: $('#bundlerPath').val(),
        jekyllPath: $('#jekyllPath').val()
      }))
      loadConfig()
    },
    onDeny: function () {
      loadConfig()
    }
  }).modal('show')
})

$('#newSiteModal form').on('submit', function (e) {
  e.preventDefault()
  var required = false
  $('#newSiteModal form input').each(function (k, e) {
    if ($(e).hasClass('require')) {
      if ($(e).val().length === 0) {
        required = true
      }
    }
  })
  if (required) {
    return false
  } else {
    $('#newSiteModal').modal('hide')
    var name = $('#newSiteName').val()
    var path = $('#newSitePath').val()
    var port = $('#newSitePort').val()
    app.sites.push({name: name, path: path, port: port, active: false, console: [], status: 'stopped'})
    if ($('#newSiteInitJekyll').is(':checked')) {
      initJekyll(path, app.sites.reverse()[0])
    }
    // Sort the site list by name
    app.sites.sort(function (a, b) { return a.name.localeCompare(b.name) })
  }
})

$('#newSitePathBrowse').on('click', function () {
  path = dialog.showOpenDialog({properties: ['openDirectory']})
  if (path) {
    $('#newSitePath').val(path)
  }
})

// Prevent drag and drop
$(document).on('dragstart dragover drop', function (e) {
  e.preventDefault()
})

$('#website').on('click', function () {
  shell.openExternal('https://chromatical.github.io/jekyll-commander')
})
