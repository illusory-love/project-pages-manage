## 背景由来

以小程序目录结构为例:
- 所有的页面都位于`pages`目录下
- 所有页面都是一个个独立的文件夹, 在文件夹内包含固定的4个文件, 然后每个文件也许都有些默认的代码、内容
- 创建好文件后还需要去`app.json`目录添加路由


又或者以一个项目为例:
- 每次的需求开发都要求新建一个项目
- 这个项目有很多的开发目录及默认的文件 (例: pages, server, tools, gulpfile.js, .gitignore)
- 在创建的过程中也许其中个别项目有 **90%** 一致, 仅剩下 **10%** 不一样



## 安装

```bash
$ sudo npm i project-pages-manage -gd
```

> 安装好后会生成主命令`proj`

## 使用

1. ##### [模版管理](./doc/TEMPLATE.md)

2. ##### [模版文件规则](./doc/TEMPRULE.md)

3. ##### 创建页面或目录

> 基本命令: proj create 或 proj c

```bash
$ proj c pagename
```
在当前路径下创建`pagename`目录, 并使用默认模版 `xcx`

```bash
$ proj c pagename -t normal
```
在当前路径下创建`pagename`目录, 并使用模版 `module`

**当在不同的模版路径下出现同名的模版时, 会提示选择, 并列出模版完整路径**

![](./doc/images/01.png)


4. ##### 删除页面或目录

> 基本命令: proj delete 或 proj d

```bash
$ proj d pagename
```



5. ##### 重置页面或目录

> 基本命令: proj reset 或 proj r

```bash
$ proj r pagename
```
在当前路径下将已经存在的页面或目录`pagename`以默认模版`xcx`进行重置

```bash
$ proj r pagename -t module
```
在当前路径下将已经存在的页面或目录`pagename`以模版`module`进行重置

**当在不同的模版路径下出现同名的模版时, 会提示选择, 并列出模版完整路径**

![](./doc/images/01.png)

6. ##### 修改默认配制项

> 基本命令: proj set config key=value

目前`config`仅有一个配制项允许修改`module=xcx`
    - module: 在创建页面时的默认模版


