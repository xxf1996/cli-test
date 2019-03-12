#!/usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer')
const Metalsmith = require('metalsmith')
const ejs = require('ejs')
const glob = require('glob')
const fse = require('fs-extra')
const path = require('path')
const downlaod = require('./download')

program
  .usage('<project-name>')
  .parse(process.argv)

let projectName = program.args[0]

if (!projectName) {
  program.help()
  return
}

console.log(`init ${projectName}`)

let tmpDir = ''

if (glob.sync(path.join('.', projectName)).length) { // 检测工程是否已经创建
  console.log(`${projectName} is exist!`)
} else {
  downlaod().then(res => {
    tmpDir = res
    return inquirer.prompt([
      {
        name: 'templateType',
        type: 'list',
        message: '选择模板类型：',
        choices: ['base', 'empty']
      }
    ])
  }).then(answer => {
    let type = answer.templateType
    return fse.move(
      path.join(tmpDir, type),
      path.join('.', projectName),
      // { overwrite: true }
    )
    // .then(res => {
    //   console.log('clear temp')
    //   return fse.emptyDir(tmpDir)
    // })
  }).then(res => {
    return inquirer.prompt([
      {
        name: 'projectName',
        message: '项目名称：',
        type: 'input',
        default: 'admin-template'
      },
      {
        name: 'projectVer',
        message: '项目版本：',
        type: 'input',
        default: '1.0.0'
      },
      {
        name: 'projectDesc',
        message: '项目描述：',
        type: 'input',
        default: 'Admin project.'
      }
    ])
  }).then(answer=> {
    // console.log(answer)
    return Metalsmith('.')
    .clean(false)
    .source(projectName)
    .destination(projectName)
    .ignore([
      'src',
      'public',
      'tests',
      'qshell'
    ])
    .use((files, metalsmith, done) => {
      Object.keys(files).forEach(name => {
        let file = files[name]
        // console.log(name)
        file.contents = Buffer.from(ejs.render(file.contents.toString(), answer))
      })

      done()
    })
    .build(err => {
      return err? Promise.reject(err): true
    })
  }).catch(err => {
    throw err
  })
}