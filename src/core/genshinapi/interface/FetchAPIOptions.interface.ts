interface APIFetchObject{
    baseURL: string
    url: string
    data?: any
    headers: Record<string, string | number | boolean>
}
/**
 * Modified from 'RequestInit'
 */
interface FetchAPIOptions {
    /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
    credentials?: RequestCredentials;
    /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
    integrity?: string;
    /** A boolean to set request's keepalive. */
    keepalive?: boolean;
    /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
    mode?: RequestMode;
    /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
    redirect?: RequestRedirect;
    /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
    referrer?: string;
    /** A referrer policy to set request's referrerPolicy. */
    referrerPolicy?: ReferrerPolicy;
    /** An AbortSignal to set request's signal. */
    signal?: AbortSignal | null;
    /** Can only be null. Used to disassociate request from any Window. */
    window?: null;
}

interface FetchError {
    code: number
    message: any
    raw: Record<string | number, any>
}