## 模版管理

> 模版主命令为: proj template 或 proj t

`add` 添加模版目录 (将指定模版目录添加至自定义模版路径中 **读取模版时将以当前命令执行目录为准查找**)

```bash
$ proj t add modulename
$ proj t add modulefolder/modulename
```


`add` 添加全局自定义模版 (以当前目录为准将指定目录作为模版添加至全局自定义模版)

```bash
$ proj t add modulename -g
$ proj t add modulefolder/modulename -g
```


`rm` 删除模版配制 (仅删除自定义模版配制路径)

```bash
$ proj t rm modulename
$ proj t rm modulefolder/modulename
```

`rm` 删除模版配制及本地对应的模版文件

```bash
$ proj t rm modulename -d
$ proj t rm modulefolder/modulename -d
```

`rm` 删除全局中的自定义模版

```bash
$ proj t rm modulename -g
$ proj t rm modulefolder/modulename -g
```

`ls` 显示所有的模版配制路径

```bash
$ proj t ls
```


