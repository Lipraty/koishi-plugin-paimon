import { Command, Context, Logger } from "../common"
import 'reflect-metadata'
export * from "./decorators"
export * from "./interface/ICommand.interface"

export const ALIAS_METADATA = 'alias'
export const PRIVATE_METADATA = 'private'
export const OPTION_METADATA = 'option:basic'
export const SUBCMD_METADATA = 'subcmd:basic'
export const SUBCMD_OPTION_METADATA = 'subcmd:options'

const log = new Logger('paimonCommand')

export class PaimonCommand {
    public readonly name: string = 'paimon'
    public readonly desc: string = '派蒙小助手，具体用法可发送paimon -h查看'

    bootstrap(context: Context, commandMethods: any[]) {
        let subCount = 0
        let optCount = 0
        commandMethods.forEach(commandTarget => {
            const subcmd: SubCommandObject = (Reflect.getMetadata(SUBCMD_METADATA, commandTarget))
            const cmdopt: CommandOption = Reflect.getMetadata(OPTION_METADATA, commandTarget)
            const pritag: boolean = Reflect.getMetadata(PRIVATE_METADATA, commandTarget)

            if(pritag){
                context = context.private()
            }
            if (subcmd) {
                subCount++
                let command = context.command(this.name, this.desc).alias('genshin', 'ys').subcommand(`.${subcmd.name}`, subcmd.desc)
                if (subcmd.alias) {
                    command = command.alias(`${this.name}.${subcmd.alias}`)
                }
                if (subcmd.options) {
                    subcmd.options.forEach(opt => {
                        command.option(opt.name, [opt.alias, opt.param, opt.desc].join(' '))
                    })
                }
                command = command.action(({ options, session, next }) => subcmd.setup(context, options, session, next))
            }
            if (cmdopt) {
                optCount++
                context.command(this.name, this.desc).alias('genshin', 'ys')
                    .option(cmdopt.name, [`-${cmdopt.alias}`, cmdopt.param, cmdopt.desc].join(' '))
                    .action(({ options, session, next }) => cmdopt.setup(context, options, session, next))
            }
        })
        log.info('loaded', subCount, 'subcommands, ', optCount, 'options.')
    }
}