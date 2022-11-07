import { PaimonUid } from "../paimon";

export function vertifyUid(uid: string) {
    return /[0-9]/g.test(uid.toString())
}

export function objectify(uids: PaimonUid[]): { [K in UID]: UserUidData } {
    return Object.fromEntries(uids.map(uidObj => {
        const K = uidObj.uid
        delete uidObj.uid
        delete uidObj.uuid
        return [K, uidObj as UserUidData]
    }))
}

export function uidParse(uuid: string, uidObject: Record<UID, UserUidData>): PaimonUid[] {
    return Object.keys(uidObject).map(uid => {
        const tmp: UserUidData = uidObject[uid]
        return Object.assign({ uuid, uid: uid as UID }, tmp)
    })
}

export function onlyUid(uids: PaimonUid[]): UID[] {
    return uids.map(o => o.uid)
}

export function uidStringifyMap(active: UID, uids: PaimonUid[], fromatFn: (value: UID, index: number) => string): string[] {
    const activeIndex = onlyUid(uids).indexOf(active)
    if (activeIndex === -1)
        throw TypeError('[paimon]Type `active` should exist.')
    //active uid to frist
    uids.unshift(uids.splice(activeIndex, 1)[0])
    return uids.map((val, i) => fromatFn(val.uid, i))
}