export interface UserData {
    uuid: string
    active_uid: UID | null
    characet_id: number[]
    uid: {
        [K in UID]: UserUID
    }
}

export interface UserUID {
    dsalt: string
    cookie: string | null
    freeze: boolean
}