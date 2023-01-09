import { PaimonUid } from "../paimon";

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