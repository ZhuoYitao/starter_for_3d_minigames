const performance = {
    timeOrigin: Date.now(),
    now: function() {
        return Date.now() - this.timeOrigin
    }
}
export default performance
