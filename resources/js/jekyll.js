function initJekyll (path, site) {
  site.status = 'initializing'
  Messenger().post({
    message: 'Initializing Jekyll for <i>' + site.name + '</i>.',
    type: 'info',
    showCloseButton: true
  })
  var runner = execFile(config.jekyllPath, ['new', '.'], {cwd: path}, function (error, stdout, stderr) {
    if (error) {
      if (error.code === 'ENOENT') {
        jekyllNotFound()
      }
      Messenger().post({
        message: 'An error occurred initializing Jekyll for <i>' + site.name + '</i>.  Run <b>jekyll new</b> manually or see the message console for details.',
        type: 'error',
        showCloseButton: true
      })
      site.console.push(stderr)
      site.status = 'error'
    } else {
      Messenger().post({
        message: 'Done initializing Jekyll for <i>' + site.name + '</i>.',
        type: 'success',
        showCloseButton: true
      })
      site.status = 'stopped'
    }
  })
}

function jekyllNotFound () {
  Messenger().post({
    message: 'Could not find the Jekyll executable.  Ensure that Jekyll is installed and the correct path is set in the configuration.',
    showCloseButton: true,
    type: 'error'
  })
}
