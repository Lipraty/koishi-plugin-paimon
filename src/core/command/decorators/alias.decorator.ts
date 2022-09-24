import { ALIAS_METADATA } from ".."

/**
 * 定义该属性别名，为保证正确加载，请在`@Subcommand`或`@CmdOption`下方使用
 * @param name 该别名名称，区别于koishi的是，无需添加`command.subcmd`或`-c`，这应该是装饰器完成的
 */
export function Alias<D extends string>(name: D): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata(ALIAS_METADATA, name, target)
    }
}