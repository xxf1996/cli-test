const download = require('download-git-repo')
const fse = require('fs-extra')
const path = require('path')

module.exports = function (targetPath = __dirname) {
  let target = path.join(targetPath, '.download-temp')
  return fse.emptyDir(target).then(res => {
    return new Promise((resolve, reject) => {
      console.log('downloading...')
      download('xxf1996/cli-template', target, err => {
        if (err) {
          reject(err)
        } else {
          resolve(target)
        }
      })
    })
  })
}