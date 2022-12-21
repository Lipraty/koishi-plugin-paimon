/**
 * 用于header的device实现，这不是一个完整的device
 * 参考自Mirai、MIraiGo、OICQ项目实现
 */

import { createHash } from "crypto"

export class DeviceInfo {
    constructor(private uid: string, private dsalt?: string) { }

    private calcSP(imei: string) {
        let sum = 0
        for (let i = 0; i < imei.length; ++i) {
            if (i % 2) {
                let j = parseInt(imei[i]) * 2
                sum += j % 10 + Math.floor(j / 10)
            } else {
                sum += parseInt(imei[i])
            }
        }
        return (100 - sum) % 10
    }

    private createImei() {
        let imei = parseInt(this.uid) % 2 ? "86" : "35"
        const buf = Buffer.alloc(4)
        buf.writeUInt32BE(parseInt(this.uid))
        let a: number | string = buf.readUInt16BE()
        let b: number | string = Buffer.concat([Buffer.alloc(1), buf.slice(1)]).readUInt32BE()
        if (a > 9999)
            a = Math.trunc(a / 10)
        else if (a < 1000)
            a = String(this.uid).substring(0, 4)
        while (b > 9999999)
            b = b >>> 1
        if (b < 1000000)
            b = String(this.uid).substring(0, 4) + String(this.uid).substring(0, 3)
        imei += a + "0" + b
        return imei + this.calcSP(imei)
    }

    /**
     * 基于UID生成设备信息，以保证每个UID请求API时是独立的设备信息，并规避单UID多随机设备导致的风控问题。
     * 
     * 现已加入DSalt作为可变随机值，以确保device信息可以更新
     */
    public createDevice(): DeviceInformation {
        const uidKey: Buffer = createHash('md5').update(this.uid + this.dsalt).digest()
        const ukHex: string = uidKey.toString('hex')

        const aid: string = `KOISHI.${Math.trunc(parseInt(ukHex, 16) / 1e+33)}.011`

        return {
            Display: aid,
            Product: 'koishi',
            Device: 'koishi',
            Board: 'lipraty',
            Model: 'koishi',
            BootId: `${ukHex.substring(0, 8)}-${ukHex.substring(8, 4)}-${ukHex.substring(12, 4)}-${ukHex.substring(16, 4)}-${ukHex.substring(20)}`,
            ProcId: `Linux version 3.0.31-${ukHex.substring(8, 16)} (android-build@hyproin.mihoyo.com)`,
            OSType: 'android',
            IMEI: this.createImei(),
            AndroidID: aid,
            VendorName: 'MIUI',
            VendorOSName: 'koishi',
            Version: {
                Incremental: uidKey.readUInt32BE(12),
                Release: (parseInt(this.uid)) % 8 + 6,
                CodeName: 'REL',
                SDK: 29
            }
        }
    }
}