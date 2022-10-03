import { PRIVATE_METADATA } from ".."

export const Private = () => {
    return target => {
        Reflect.defineMetadata(PRIVATE_METADATA, true, target)
    }
}