/** @hidden */
var WebGLHardwareTexture = /** @class */ (function () {
    function WebGLHardwareTexture(existingTexture, context) {
        if (existingTexture === void 0) { existingTexture = null; }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        this._MSAARenderBuffer = null;
        this._context = context;
        if (!existingTexture) {
            existingTexture = context.createTexture();
            if (!existingTexture) {
                throw new Error("Unable to create webGL texture");
            }
        }
        this.set(existingTexture);
    }
    Object.defineProperty(WebGLHardwareTexture.prototype, "underlyingResource", {
        get: function () {
            return this._webGLTexture;
        },
        enumerable: false,
        configurable: true
    });
    WebGLHardwareTexture.prototype.setUsage = function () { };
    WebGLHardwareTexture.prototype.set = function (hardwareTexture) {
        this._webGLTexture = hardwareTexture;
    };
    WebGLHardwareTexture.prototype.reset = function () {
        this._webGLTexture = null;
        this._MSAARenderBuffer = null;
    };
    WebGLHardwareTexture.prototype.release = function () {
        if (this._MSAARenderBuffer) {
            this._context.deleteRenderbuffer(this._MSAARenderBuffer);
            this._MSAARenderBuffer = null;
        }
        if (this._webGLTexture) {
            this._context.deleteTexture(this._webGLTexture);
        }
        this.reset();
    };
    return WebGLHardwareTexture;
}());
export { WebGLHardwareTexture };
//# sourceMappingURL=webGLHardwareTexture.js.map