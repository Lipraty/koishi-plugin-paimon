export class Random {
    public static sample(array: Array<any>, count: number) {
        let shuffled = array.slice(0), i = array.length, min = i - count, temp, index
        while (i-- > min) {
            index = (Math.floor((i + 1) * Math.random()))
            temp = shuffled[index]
            shuffled[index] = shuffled[i]
            shuffled[i] = temp
        }
        return shuffled.slice(min)
    }

    public static randint(start: number, stop: number) {
        return Math.floor(Math.random() * (start - stop)) + start
    }

    public static randstr() {

    }

    public static randUA(appVer: string, device) {
        let UAS = [
            `Mozilla/5.0 (Linux; Android 12; ${device}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.73 Mobile Safari/537.36`,
            `Mozilla/5.0 (Linux; Android 12; Unspecified Device) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36`
        ]

        return UAS[this.randint(0, UAS.length)] + ` miHoYoBBS/${appVer}`
    }

    public static randRef(act_id: string){
        let Refs = [
            'https://app.mihoyo.com',
            `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${act_id}&utm_source=bbs&utm_medium=mys&utm_campaign=icon`
        ]

        return Refs[this.randint(0, Refs.length)]
    }
}