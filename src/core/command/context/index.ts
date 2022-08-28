type modulesContextKeys = Array<string>

interface ModulesContext {
    id: string
    name: string
    keys: modulesContextKeys
}

export function modulesContext(path: string, traverse: boolean, fileMatch: RegExp | string): CommandOptions[] {
    let keys: modulesContextKeys = []
    
    return 
}