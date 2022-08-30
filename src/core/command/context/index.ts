import { ICommand } from ".."
import { readdirSync, statSync } from "fs"
import { resolve } from "path"

interface ModuleContext {
    name: string
    path: string
    length: number
    keys: any[]
}
// const log = new Logger('paimon-modulesContext')

const readDirSync = path => {
    const result = [], dirs = []
    const files = readdirSync(path)
    files.forEach(file => {
        const stat = statSync(resolve(path, file))
        stat.isDirectory() ? dirs.push(file) : result.push(resolve(path, file))
    })
    dirs.forEach(dir => result.push(...readDirSync(resolve(path, dir))))
    return result
}

/**
 * 
 * @param path 
 * @param useSubdirectories 
 * @param fileMatch 
 * @returns 
 */
export function modulesContext(path: string, useSubdirectories: boolean, fileMatch: RegExp) {
    path = resolve(__dirname, '../../../', path)
    let length: number = 0
    let cmds: ICommand[] = []
    let fileArray = useSubdirectories ? readDirSync(path) : readdirSync(path).filter(sub => !statSync(resolve(path, sub)).isDirectory())
    fileArray.filter(file => fileMatch.test(file))

    const mctx = file => require(file)
    mctx.keys = () => fileArray.map(file => resolve(path, file))

    return mctx
}