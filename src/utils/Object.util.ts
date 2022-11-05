declare interface Object {
    /**
     * this object is empty
     * - self extend and with '$' as a prefix to ensure compatibility with later api.
     * @param o 
     */
    $isEmpty(o: object): boolean
}

Object.prototype.$isEmpty = (o: object) => {
    return Object.keys(o).length === 0
}

function isEmpty(o: object) {
    return Object.keys(o).length === 0
}