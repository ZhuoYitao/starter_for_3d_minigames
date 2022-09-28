
/**
 * @hidden
 **/
var StencilState = /** @class */ (function () {
    function StencilState() {
        this.reset();
    }
    StencilState.prototype.reset = function () {
        this.enabled = false;
        this.mask = 0xff;
        this.func = StencilState.ALWAYS;
        this.funcRef = 1;
        this.funcMask = 0xff;
        this.opStencilFail = StencilState.KEEP;
        this.opDepthFail = StencilState.KEEP;
        this.opStencilDepthPass = StencilState.REPLACE;
    };
    Object.defineProperty(StencilState.prototype, "stencilFunc", {
        get: function () {
            return this.func;
        },
        set: function (value) {
            this.func = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilState.prototype, "stencilFuncRef", {
        get: function () {
            return this.funcRef;
        },
        set: function (value) {
            this.funcRef = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilState.prototype, "stencilFuncMask", {
        get: function () {
            return this.funcMask;
        },
        set: function (value) {
            this.funcMask = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilState.prototype, "stencilOpStencilFail", {
        get: function () {
            return this.opStencilFail;
        },
        set: function (value) {
            this.opStencilFail = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilState.prototype, "stencilOpDepthFail", {
        get: function () {
            return this.opDepthFail;
        },
        set: function (value) {
            this.opDepthFail = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilState.prototype, "stencilOpStencilDepthPass", {
        get: function () {
            return this.opStencilDepthPass;
        },
        set: function (value) {
            this.opStencilDepthPass = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilState.prototype, "stencilMask", {
        get: function () {
            return this.mask;
        },
        set: function (value) {
            this.mask = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilState.prototype, "stencilTest", {
        get: function () {
            return this.enabled;
        },
        set: function (value) {
            this.enabled = value;
        },
        enumerable: false,
        configurable: true
    });
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will always pass. i.e. Pixels will be drawn in the order they are drawn */
    StencilState.ALWAYS = 519;
    /** Passed to stencilOperation to specify that stencil value must be kept */
    StencilState.KEEP = 7680;
    /** Passed to stencilOperation to specify that stencil value must be replaced */
    StencilState.REPLACE = 7681;
    return StencilState;
}());
export { StencilState };
//# sourceMappingURL=stencilState.js.map