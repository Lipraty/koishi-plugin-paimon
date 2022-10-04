interface SubCommandObject {
    name: string,
    setup: (ctx, option, session, next) => string | void | Promise<string | void>,
    alias?: string,
    param?: string,
    desc?: string,
    options?: SubCommandOption[]
}

interface SubCommandOption {
    name: string,
    alias?: string,
    param?: string,
    desc?: string,
    fn?: Function
}