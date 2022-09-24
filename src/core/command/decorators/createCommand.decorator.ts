import { ALIAS_METADATA, OPTION_METADATA, SUBCMD_METADATA, SUBCMD_OPTION_METADATA } from ".."

type commandMethodType = 'subcommand' | 'option'

export const createCommandDecorator = (method: commandMethodType) => <D extends string>(name: D, param?: string, desc?: string): ClassDecorator => {
    return (target: any) => {
        const prototype = Object.getPrototypeOf(new target())
        const methodNames = Object.getOwnPropertyNames(prototype)
        if (method === 'subcommand') {
            let options: SubCommandOption[] = []
            methodNames.forEach(_name => {
                if (_name !== 'constructor' && _name !== 'setup' && prototype[_name])
                    options.push(Reflect.getMetadata(SUBCMD_OPTION_METADATA, prototype[_name]))
            })
            Reflect.defineMetadata(SUBCMD_METADATA, {
                name,
                alias: Reflect.getMetadata(ALIAS_METADATA, target),
                param,
                desc,
                options,
                setup: prototype['setup'] as (option, session, next) => string | void | Promise<string | void>
            }, target)
        } else if (method === 'option') {
            Reflect.defineMetadata(OPTION_METADATA, {
                name,
                alias: Reflect.getMetadata(ALIAS_METADATA, target),
                param,
                desc,
                setup: prototype['setup'] as (option, session, next) => string | void | Promise<string | void>
            }, target)
        }
    }
}