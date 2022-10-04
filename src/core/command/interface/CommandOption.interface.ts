interface CommandOption {
    name: string,
    setup: (ctx, option, session, next) => string | void | Promise<string | void>,
    alias?: string,
    param?: string,
    desc?: string
}