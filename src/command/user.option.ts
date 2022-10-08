export default (value, session) => {
    return 'user,' + JSON.stringify(session)
}