/**
 * @hidden
 **/
var StencilStateComposer = /** @class */ (function () {
    function StencilStateComposer(reset) {
        if (reset === void 0) { reset = true; }
        this._isStencilTestDirty = false;
        this._isStencilMaskDirty = false;
        this._isStencilFuncDirty = false;
        this._isStencilOpDirty = false;
        this.useStencilGlobalOnly = false;
        if (reset) {
            this.reset();
        }
    }
    Object.defineProperty(StencilStateComposer.prototype, "isDirty", {
        get: function () {
            return this._isStencilTestDirty || this._isStencilMaskDirty || this._isStencilFuncDirty || this._isStencilOpDirty;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilStateComposer.prototype, "func", {
        get: function () {
            return this._func;
        },
        set: function (value) {
            if (this._func === value) {
                return;
            }
            this._func = value;
            this._isStencilFuncDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilStateComposer.prototype, "funcRef", {
        get: function () {
            return this._funcRef;
        },
        set: function (value) {
            if (this._funcRef === value) {
                return;
            }
            this._funcRef = value;
            this._isStencilFuncDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilStateComposer.prototype, "funcMask", {
        get: function () {
            return this._funcMask;
        },
        set: function (value) {
            if (this._funcMask === value) {
                return;
            }
            this._funcMask = value;
            this._isStencilFuncDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilStateComposer.prototype, "opStencilFail", {
        get: function () {
            return this._opStencilFail;
        },
        set: function (value) {
            if (this._opStencilFail === value) {
                return;
            }
            this._opStencilFail = value;
            this._isStencilOpDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilStateComposer.prototype, "opDepthFail", {
        get: function () {
            return this._opDepthFail;
        },
        set: function (value) {
            if (this._opDepthFail === value) {
                return;
            }
            this._opDepthFail = value;
            this._isStencilOpDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilStateComposer.prototype, "opStencilDepthPass", {
        get: function () {
            return this._opStencilDepthPass;
        },
        set: function (value) {
            if (this._opStencilDepthPass === value) {
                return;
            }
            this._opStencilDepthPass = value;
            this._isStencilOpDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilStateComposer.prototype, "mask", {
        get: function () {
            return this._mask;
        },
        set: function (value) {
            if (this._mask === value) {
                return;
            }
            this._mask = value;
            this._isStencilMaskDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StencilStateComposer.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            if (this._enabled === value) {
                return;
            }
            this._enabled = value;
            this._isStencilTestDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    StencilStateComposer.prototype.reset = function () {
        var _a;
        this.stencilMaterial = undefined;
        (_a = this.stencilGlobal) === null || _a === void 0 ? void 0 : _a.reset();
        this._isStencilTestDirty = true;
        this._isStencilMaskDirty = true;
        this._isStencilFuncDirty = true;
        this._isStencilOpDirty = true;
    };
    StencilStateComposer.prototype.apply = function (gl) {
        var _a;
        if (!gl) {
            return;
        }
        var stencilMaterialEnabled = !this.useStencilGlobalOnly && !!((_a = this.stencilMaterial) === null || _a === void 0 ? void 0 : _a.enabled);
        this.enabled = stencilMaterialEnabled ? this.stencilMaterial.enabled : this.stencilGlobal.enabled;
        this.func = stencilMaterialEnabled ? this.stencilMaterial.func : this.stencilGlobal.func;
        this.funcRef = stencilMaterialEnabled ? this.stencilMaterial.funcRef : this.stencilGlobal.funcRef;
        this.funcMask = stencilMaterialEnabled ? this.stencilMaterial.funcMask : this.stencilGlobal.funcMask;
        this.opStencilFail = stencilMaterialEnabled ? this.stencilMaterial.opStencilFail : this.stencilGlobal.opStencilFail;
        this.opDepthFail = stencilMaterialEnabled ? this.stencilMaterial.opDepthFail : this.stencilGlobal.opDepthFail;
        this.opStencilDepthPass = stencilMaterialEnabled ? this.stencilMaterial.opStencilDepthPass : this.stencilGlobal.opStencilDepthPass;
        this.mask = stencilMaterialEnabled ? this.stencilMaterial.mask : this.stencilGlobal.mask;
        if (!this.isDirty) {
            return;
        }
        // Stencil test
        if (this._isStencilTestDirty) {
            if (this.enabled) {
                gl.enable(gl.STENCIL_TEST);
            }
            else {
                gl.disable(gl.STENCIL_TEST);
            }
            this._isStencilTestDirty = false;
        }
        // Stencil mask
        if (this._isStencilMaskDirty) {
            gl.stencilMask(this.mask);
            this._isStencilMaskDirty = false;
        }
        // Stencil func
        if (this._isStencilFuncDirty) {
            gl.stencilFunc(this.func, this.funcRef, this.funcMask);
            this._isStencilFuncDirty = false;
        }
        // Stencil op
        if (this._isStencilOpDirty) {
            gl.stencilOp(this.opStencilFail, this.opDepthFail, this.opStencilDepthPass);
            this._isStencilOpDirty = false;
        }
    };
    return StencilStateComposer;
}());
export { StencilStateComposer };
//# sourceMappingURL=stencilStateComposer.js.map