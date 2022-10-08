export class UUID {
    public static randomUUID() {
        const v4 = () => {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        }
        return (v4() + v4() + '-' + v4() + '-' + v4() + '-' + v4() + '-' + v4() + v4() + v4())
    }
}