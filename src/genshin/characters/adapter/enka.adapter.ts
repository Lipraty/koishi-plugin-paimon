export class EnkaAdapter {
    private baseURL: URL = new URL('https://enka.network/')
    private uid: string

    public setup(uid: string, proxyAgent?: URL){
        this.uid = uid
        this.baseURL.pathname = `/json/${uid}`
        if(proxyAgent)
            this.baseURL = proxyAgent
    }

    public async findPanel(){
        return await fetch(this.baseURL.href, {
            
        })
    }
}