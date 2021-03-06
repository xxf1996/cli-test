基于`d2-admin`的中后台项目脚手架探索。

## 基本用法（探索中）

1. `init <project-name>`：在当前路径下生成一个名为`project-name`的项目（文件夹）；输入命令后，会有几个提示选项用来配置项目：

- 模板类型：即选择哪一套模板
- 项目名称：
- 项目版本：
- 项目描述：

2. `page <page-name>`：在当前项目中生成一个名为`page-name`的`vue`页面文件；输入命令后依然会有几个提示选项用来配置页面：

- 页面模板：即使用哪个页面模板来生成新的页面；
- 页面路由：当前页面对应的完整路由；
- 页面标题：页面在菜单中对应的标题；

## 当前思路

1. 使用`init`命令来快速初始化一个项目，可以自选模板；
2. 利用`page`命令来快速生成一个新的页面，并生成对应的路由和菜单信息；
3. 将菜单和路由信息进行拆分；一级路由（菜单）为一个文件夹，该文件夹下的`index.js`文件即为该路由（菜单）信息，文件夹下的其它`.js`文件每个相当于该路由（菜单）下的子路由（菜单）信息；这样拆分有利于自动化建立和解析路由（菜单）信息。