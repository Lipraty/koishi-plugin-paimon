import { stringify, v1, V1Options, v3, v4, v5, version } from 'uuid';

type OutputBuffer = ArrayLike<number>;
type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

/**
 * TypeScript implementation of UUID function style in Java
 */
class GUID {
    private bytes: OutputBuffer;
    private version: number;

    constructor(uuid: OutputBuffer) {
        this.bytes = uuid;
        this.version = version(stringify(uuid));
    }

    /**
     * The nil UUID string (all zeros)
     */
    public static get NIL(): string {
        return '00000000-0000-0000-0000-000000000000';
    }

    /**
     * DNS namespace from name-based hash
     */
    public static get DNS(): string {
        return '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    }

    /**
     * URL namespace from name-based hash
     */
    public static get URL(): string {
        return '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
    }

    /**
     * UUID from timestamp (version 1)
     * @param msecs RFC "timestamp" field (Number of milliseconds, unix epoch)
     * @param nsecs RFC "timestamp" field (Number of nanseconds to add to msecs, should be 0-10,000)
     * - overloads
     * @param node RFC "node" field as an Array[6] of byte values (per 4.1.6)
     * @param clockseq RFC "clock sequence" as a Number between 0 - 0x3fff
     */
    public static timestampUUIDFromBytes(): GUID;
    public static timestampUUIDFromBytes(msecs: number | Date, nsecs: number): GUID;
    public static timestampUUIDFromBytes(msecs: number | Date, nsecs: number, node: Tuple<number, 6>, clockseq: number): GUID;
    public static timestampUUIDFromBytes(msecs?: number | Date, nsecs?: number, node?: Tuple<number, 6>, clockseq?: number): GUID {
        let options: V1Options = {
            msecs: msecs || undefined,
            nsecs: (nsecs <= 10000 && nsecs >= 0) ? nsecs : undefined,
            node: node || undefined,
            clockseq: (clockseq <= 0x3fff) ? clockseq : undefined
        }
        let buf = new Uint8Array(18);
        return new GUID(v1(options, buf));
    }

    /**
     * UUID from name-based of MD5 hash (version 3)
     * - Per the RFC, "If backward compatibility is not an issue, SHA-1 [Version 5] is preferred."
     * @param name name-based of the constructed UUID
     * @param namespace Namespace UUID
     * @deprecated You should use `snameUUIDFromBytes`
     */
    public static nameUUIDFromBytes(name: string, namespace: string = this.NIL): GUID {
        let buf = new Uint8Array(16 + name.length);
        return new GUID(v3(name, namespace, buf));
    }

    /**
     * Create a random UUID (version 4)
     */
    public static randomUUID(): GUID {
        let buf = new Uint8Array(16);
        return new GUID(v4({}, buf));
    }

    /**
     * UUID from name-based of SHA-1 hash (version 5)
     * @param name name-based of the constructed UUID
     * @param namespace Namespace UUID
     */
    public static snameUUIDFromBytes(name: string, namespace: string = this.NIL): GUID {
        let buf = new Uint8Array(16 + name.length);
        return new GUID(v5(name, namespace, buf));
    }

    /**
     * Unsigned UUID
     */
    unsign(): string { return; }

    /**
     * UUID to string
     */
    toString(): string { return stringify(this.bytes); }
}

GUID.prototype.unsign = function (): string {
    return this.toString().replace(/-/gi, '');
}

GUID.prototype.toString = function (): string {
    return stringify(this.bytes);
}

export { GUID as UUID }