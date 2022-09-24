# koishi-plugin-paimon/命令注册核心

基于koishi的decorator实现。主要是让自己用得爽，并**不是**完整实现。

仅实现了以下功能：

- `@Subcommand` 注册一个子命令
- `@CmdOption` 注册一个选项至主命令中
- `@Alias` 添加别名

## 使用方法

```TypeScript
//注册一个subcommand
@Subcommand('cmdname', '[param:string]', 'desc...')
@Alias('c') //为该子命令提供一个别名，等价于subcommand(...).alias('base.c')
export class useCmd extends ISubCommand { //继承ISubCommand接口可以获得更好的代码提示与准确的类型限制。
    //该子命令的执行函数，等价于subcommand(...).action({option, session, next} => {})
    setup(option: object, session: Session, next: Next){
        //Your code...
    }
    //如果需要在subcommand载入options
    //所有的子option都将传入setup(option)中。
    @option('-c', '[param]', 'this a option, name is `call` and alias is `-c`.')
    call() {}
}

//注册一个option，其实与subcommand无太大差别。
@CmdOption('option', '[param:string]', 'desc...')
@Alias('o') //为该选项提供一个别名，等价于option(...).alias('o')
export class opt extends ICmdOption { //继承ICmdOption接口可以获得更好的代码提示与准确的类型限制。
    //该选项的执行函数，等价于option(...).action({option, session, next} => {})
    setup(option: object, session: Session, next: Next){
        //Your code...
    }
}
```

> 由于目前decorator的机制原因，`@Alias` 应当在 `@Subcommand`/`@CmdOption` 下方，以保证执行顺序。