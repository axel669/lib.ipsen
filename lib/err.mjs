function IpsenError(...args) {
    const instance = Reflect.construct(Error, args)
    Reflect.setPrototypeOf(instance, Reflect.getPrototypeOf(this))
    return instance
}
IpsenError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
    }
})
Reflect.setPrototypeOf(IpsenError, Error)

export default IpsenError
