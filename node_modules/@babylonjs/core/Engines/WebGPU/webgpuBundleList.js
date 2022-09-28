/** @hidden */
var WebGPURenderItemViewport = /** @class */ (function () {
    function WebGPURenderItemViewport(x, y, w, h) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.w = Math.floor(w);
        this.h = Math.floor(h);
    }
    WebGPURenderItemViewport.prototype.run = function (renderPass) {
        renderPass.setViewport(this.x, this.y, this.w, this.h, 0, 1);
    };
    WebGPURenderItemViewport.prototype.clone = function () {
        return new WebGPURenderItemViewport(this.x, this.y, this.w, this.h);
    };
    return WebGPURenderItemViewport;
}());
export { WebGPURenderItemViewport };
/** @hidden */
var WebGPURenderItemScissor = /** @class */ (function () {
    function WebGPURenderItemScissor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    WebGPURenderItemScissor.prototype.run = function (renderPass) {
        renderPass.setScissorRect(this.x, this.y, this.w, this.h);
    };
    WebGPURenderItemScissor.prototype.clone = function () {
        return new WebGPURenderItemScissor(this.x, this.y, this.w, this.h);
    };
    return WebGPURenderItemScissor;
}());
export { WebGPURenderItemScissor };
/** @hidden */
var WebGPURenderItemStencilRef = /** @class */ (function () {
    function WebGPURenderItemStencilRef(ref) {
        this.ref = ref;
    }
    WebGPURenderItemStencilRef.prototype.run = function (renderPass) {
        renderPass.setStencilReference(this.ref);
    };
    WebGPURenderItemStencilRef.prototype.clone = function () {
        return new WebGPURenderItemStencilRef(this.ref);
    };
    return WebGPURenderItemStencilRef;
}());
export { WebGPURenderItemStencilRef };
/** @hidden */
var WebGPURenderItemBlendColor = /** @class */ (function () {
    function WebGPURenderItemBlendColor(color) {
        this.color = color;
    }
    WebGPURenderItemBlendColor.prototype.run = function (renderPass) {
        renderPass.setBlendConstant(this.color);
    };
    WebGPURenderItemBlendColor.prototype.clone = function () {
        return new WebGPURenderItemBlendColor(this.color);
    };
    return WebGPURenderItemBlendColor;
}());
export { WebGPURenderItemBlendColor };
/** @hidden */
var WebGPURenderItemBeginOcclusionQuery = /** @class */ (function () {
    function WebGPURenderItemBeginOcclusionQuery(query) {
        this.query = query;
    }
    WebGPURenderItemBeginOcclusionQuery.prototype.run = function (renderPass) {
        renderPass.beginOcclusionQuery(this.query);
    };
    WebGPURenderItemBeginOcclusionQuery.prototype.clone = function () {
        return new WebGPURenderItemBeginOcclusionQuery(this.query);
    };
    return WebGPURenderItemBeginOcclusionQuery;
}());
export { WebGPURenderItemBeginOcclusionQuery };
/** @hidden */
var WebGPURenderItemEndOcclusionQuery = /** @class */ (function () {
    function WebGPURenderItemEndOcclusionQuery() {
    }
    WebGPURenderItemEndOcclusionQuery.prototype.run = function (renderPass) {
        renderPass.endOcclusionQuery();
    };
    WebGPURenderItemEndOcclusionQuery.prototype.clone = function () {
        return new WebGPURenderItemEndOcclusionQuery();
    };
    return WebGPURenderItemEndOcclusionQuery;
}());
export { WebGPURenderItemEndOcclusionQuery };
var WebGPURenderItemBundles = /** @class */ (function () {
    function WebGPURenderItemBundles() {
        this.bundles = [];
    }
    WebGPURenderItemBundles.prototype.run = function (renderPass) {
        renderPass.executeBundles(this.bundles);
    };
    WebGPURenderItemBundles.prototype.clone = function () {
        var cloned = new WebGPURenderItemBundles();
        cloned.bundles = this.bundles;
        return cloned;
    };
    return WebGPURenderItemBundles;
}());
/** @hidden */
var WebGPUBundleList = /** @class */ (function () {
    function WebGPUBundleList(device) {
        this.numDrawCalls = 0;
        this._device = device;
        this._list = new Array(10);
        this._listLength = 0;
    }
    WebGPUBundleList.prototype.addBundle = function (bundle) {
        if (!this._currentItemIsBundle) {
            var item = new WebGPURenderItemBundles();
            this._list[this._listLength++] = item;
            this._currentBundleList = item.bundles;
            this._currentItemIsBundle = true;
        }
        if (bundle) {
            this._currentBundleList.push(bundle);
        }
    };
    WebGPUBundleList.prototype._finishBundle = function () {
        if (this._currentItemIsBundle && this._bundleEncoder) {
            this._currentBundleList.push(this._bundleEncoder.finish());
            this._bundleEncoder = undefined;
            this._currentItemIsBundle = false;
        }
    };
    WebGPUBundleList.prototype.addItem = function (item) {
        this._finishBundle();
        this._list[this._listLength++] = item;
        this._currentItemIsBundle = false;
    };
    WebGPUBundleList.prototype.getBundleEncoder = function (colorFormats, depthStencilFormat, sampleCount) {
        if (!this._currentItemIsBundle) {
            this.addBundle();
            this._bundleEncoder = this._device.createRenderBundleEncoder({
                colorFormats: colorFormats,
                depthStencilFormat: depthStencilFormat,
                sampleCount: sampleCount,
            });
        }
        return this._bundleEncoder;
    };
    WebGPUBundleList.prototype.close = function () {
        this._finishBundle();
    };
    WebGPUBundleList.prototype.run = function (renderPass) {
        this.close();
        for (var i = 0; i < this._listLength; ++i) {
            this._list[i].run(renderPass);
        }
    };
    WebGPUBundleList.prototype.reset = function () {
        this._listLength = 0;
        this._currentItemIsBundle = false;
        this.numDrawCalls = 0;
    };
    WebGPUBundleList.prototype.clone = function () {
        this.close();
        var cloned = new WebGPUBundleList(this._device);
        cloned._list = new Array(this._listLength);
        cloned._listLength = this._listLength;
        cloned.numDrawCalls = this.numDrawCalls;
        for (var i = 0; i < this._listLength; ++i) {
            cloned._list[i] = this._list[i].clone();
        }
        return cloned;
    };
    return WebGPUBundleList;
}());
export { WebGPUBundleList };
//# sourceMappingURL=webgpuBundleList.js.map