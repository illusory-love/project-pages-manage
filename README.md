## 安装

```bash
$ sudo npm i project-pages-manage -gd
```

> 安装好后会生成主命令`proj`

## 使用

- [模版管理](./doc/TEMPLATE.md)

- 创建页面或目录

> 基本命令: proj create 或 proj c

```bash
$ proj c pagename
```
在当前路径下创建`pagename`目录, 并使用默认模版 `normal`

```bash
$ proj c pagename -t xcx
```
在当前路径下创建`pagename`目录, 并使用模版 `xcx`

**当在不同的模版路径下出现同名的模版时, 会提示选择, 并列出模版完整路径**


- 删除页面或目录

> 基本命令: proj delete 或 proj d

```bash
$ proj d pagename
```

- 重置页面或目录

> 基本命令: proj reset 或 proj r

```bash
$ proj r pagename
```
在当前路径下将已经存在的页面或目录`pagename`以默认模版`normal`进行重置

```bash
$ proj r pagename -t xcx
```
在当前路径下将已经存在的页面或目录`pagename`以模版`xcx`进行重置

**当在不同的模版路径下出现同名的模版时, 会提示选择, 并列出模版完整路径**
