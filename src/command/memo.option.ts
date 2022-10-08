export default (value, session) => {
    return 'memo,' + JSON.stringify(session)
}