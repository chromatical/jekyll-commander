const {BrowserWindow} = require('electron').remote
var win = BrowserWindow.getFocusedWindow()
$('#minimizeWindow').on('click', function () {
  win.minimize()
})
$('#maximizeWindow').on('click', function () {
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
})
$('#closeWindow').on('click', function () {
  win.close()
})

window.onbeforeunload = function (e) {
  app.sites.forEach(function (site) {
    if (site.runner) {
      try {
        site.runner.kill()
      } catch (e) {
      }
    }
  })
  storeSites(app.sites)
}
