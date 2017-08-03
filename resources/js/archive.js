var fs = require('fs')
var path = require('path')
var archiver = require('archiver')
function createArchive (siteToExport, savePath) {
  Messenger().post({
    message: 'Exporting zip for <i>' + siteToExport.name + '</i>.',
    showCloseButton: true,
    type: 'info'
  })
  var output = fs.createWriteStream(savePath)
  output.on('close', function () {
    Messenger().post({
      message: 'Done exporting zip for <i>' + siteToExport.name + '</i>.',
      showCloseButton: true,
      type: 'success'
    })
  })
  var archive = archiver('zip', {
    zlib: { level: 9 }
  })
  archive.pipe(output)
  archive.directory(path.join(siteToExport.path, '_site'), false)
  archive.finalize()
}
