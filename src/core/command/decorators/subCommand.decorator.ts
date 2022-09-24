import 'reflect-metadata'
import { SUBCMD_OPTION_METADATA } from '..'
import { createCommandDecorator } from './createCommand.decorator'
/**
 * 定义一个子命令，相对于koishi，无需添加`.`，这应该是装饰器所做的
 * @param name 子命令名称
 * @param param 子命令所接受的参数，`<param>`定义为必须参数，`[param]`则定义为可选参数
 * @param desc 该子命令的说明文本
 */
export const SubCommand = createCommandDecorator('subcommand')

/**
 * 用于Subcommand的选项
 * @param alias 选项的别名
 * @param param 选项所需要的参数
 * @param desc 选项说明
 */
export function option(alias?: string, param?: string, desc?: string): MethodDecorator {
    return <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
        Reflect.defineMetadata(SUBCMD_OPTION_METADATA, {
            name: propertyKey,
            alias,
            param,
            desc,
            fn: descriptor.value
        }, descriptor.value as Function)
    }
}