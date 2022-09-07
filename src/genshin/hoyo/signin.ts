import { ServerType } from ".";

export class HoyoDS {
    private _st: 'cn' | 'os'

    constructor(serverType: ServerType) {
        if (serverType === ServerType.CN || serverType === ServerType.CNB) {
            this._st = 'cn'
        } else {
            this._st = 'os'
        }
    }

    public getSalt() {

    }
}