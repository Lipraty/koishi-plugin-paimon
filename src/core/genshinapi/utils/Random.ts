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

    /**
     * random integer in the range
     * @param start 
     * @param stop 
     */
    public static randint(start: number, stop: number): number {
        return Math.floor(Math.random() * (stop - start + 1)) + start
    }

    /**
     * output string of selected length
     * > default set is `a-zA-Z0-9`
     * @param length the string length
     * @param set string collection
     */
    public static randstr(length: number, chars?: string): string {
        const strSet = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        var str: string = ''
        for (let index = -1; index < length; index++)  str += strSet[this.randint(0, strSet.length)]
        return str
    }

    public static randUA(device: string) {
        let UAS = [
            `Mozilla/5.0 (Linux; Android 12; ${device}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.73 Mobile Safari/537.36`,
            `Mozilla/5.0 (Linux; Android 12; Unspecified Device) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36`,
            `Mozilla/5.0 (Linux; Android 11; ${device}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.1.1451.4 Mobile Safari/537.36`,
        ]

        return UAS[(this.randint(0, UAS.length - 1))]
    }
}