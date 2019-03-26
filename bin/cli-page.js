#!/usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer')
const glob = require('glob')
const fse = require('fs-extra')
const path = require('path')
const Metal = require('metalsmith')
const ejs = require('ejs')

program
  .usage('<page-name>')
  .parse(process.argv)

let pageName = program.args[0]

if (!pageName) {
  program.help()
  return
}

const curPath = process.cwd()
let pageConfig = {}

if (glob.sync(path.join('.', 'vue.config.js')).length) {
  inquirer.prompt([
    {
      name: 'pageType',
      type: 'input',
      message: '使用页面模板：',
      default: 'demo'
    },
    {
      name: 'pageRoute',
      type: 'input',
      message: '页面路由地址：'
    },
    {
      name: 'pageTitle',
      type: 'input',
      message: '页面标题：',
      default: pageName
    }
  ]).then(answer => { // 复制页面模板文件
    const pageTemp = path.join(__dirname, '.download-temp', 'page_template')
    const pageDir = path.join('src', 'pages', pageName)
    pageConfig = Object.assign({}, answer, { pageName, pageDir })
    return fse.copy(path.join(pageTemp, answer.pageType), pageDir)
  }).then(res => { // 渲染页面的模板
    return new Metal(pageConfig.pageDir)
      .clean(false)
      .source('.')
      .destination('.')
      .use((files, metalsmith, done) => {
        Object.keys(files).forEach(name => {
          let file = files[name]
          file.contents = Buffer.from(ejs.render(file.contents.toString(), pageConfig))
        })
        done()
      })
      .build(err => {
        return err? Promise.reject(err): true
      })
  }).then(() => { // 复制路由模板文件至相应路径
    const routeTemp = path.join(__dirname, '.download-temp', 'route_template')
    let res
    let routePath = pageConfig.pageRoute.split('/')
    const routeDir = path.join('src', 'router', routePath[1])
    if (routePath.length === 2) {
      res = fse.copy(path.join(routeTemp, 'haveChild.js'), path.join(routeDir, 'index.js'))
    } else if (routePath.length === 3) {
      res = fse.copy(path.join(routeTemp, 'noChild.js'), path.join(routeDir, routePath[2] + '.js'))
    }
    Object.assign(pageConfig, {
      routeDir,
      pageSrc: `@/pages/${pageConfig.pageName}/Index` // 对应页面组件路径
    })
    return res
  }).then(res => { // 对路由模板文件进行渲染
    console.log(pageConfig)
    return new Metal(pageConfig.routeDir)
      .clean(false)
      .source('.')
      .destination('.')
      .use((files, metalsmith, done) => {
        Object.keys(files).forEach(name => {
          let file = files[name]
          file.contents = Buffer.from(ejs.render(file.contents.toString(), pageConfig))
        })
        done()
      })
      .build(err => {
        return err? Promise.reject(err): true
      })
  }).catch(err => {
    console.log(err)
  })
} else {
  console.log('当前目录不是项目路径！')
}