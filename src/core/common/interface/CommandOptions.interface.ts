interface CommandOptions {
    cmd: string
    action: (args: string[]) => string | void
    alias: string | "" | undefined
    level: 0 | 1
    params?: string[]
    enter?: string
}