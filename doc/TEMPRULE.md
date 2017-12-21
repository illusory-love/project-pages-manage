## 模版目录结构

```
customModule
    ├─ module
    |   ├─ somefiles
    |   ├─ somefiles
    |   ├─ ...
    ├─ config.yml
    ├─ srcipt.js
```

- `customModule` 
    - 模版名称

- `module` (**必需**) 
    - 目录名称固定
    - 里面存放的是创建模版时需要复制的所有文件

- `config.yml` (**可选**) 当前模版的一些配制信息

- `sccript.js` (**可选**) 在创建模版时的事件监听
    - 目前仅支持两个监听 `onBefore` & `onAfter`
    - 两监听返回的参数一致
        - option.cmd: 当前命令名称
        - option.modulePath: 当前模版的完整路径
        - option.targetPath: 根据模版创建页面时的目标位置完整路径
        - option.config: 当前模版的配置信息
    - 在 `onBefore` 中只有 `return false;` 会中止页面的创建行为
    - 在 `onBefore` 中如果存在异步行为请使用 `await` 操作, 否则页面的创建不会等待异步的操作结果

示例: 
```js
exports.onBefore = async ({ cmd, modulePath, targetPath, config }) => {}

exports.onAfter  = async ({ cmd, modulePath, targetPath, config }) => {}
```

