/** @hidden */
var DrawWrapper = /** @class */ (function () {
    function DrawWrapper(engine, createMaterialContext) {
        if (createMaterialContext === void 0) { createMaterialContext = true; }
        this.effect = null;
        this.defines = null;
        this.drawContext = engine.createDrawContext();
        if (createMaterialContext) {
            this.materialContext = engine.createMaterialContext();
        }
    }
    DrawWrapper.IsWrapper = function (effect) {
        return effect.getPipelineContext === undefined;
    };
    DrawWrapper.GetEffect = function (effect) {
        return effect.getPipelineContext === undefined ? effect.effect : effect;
    };
    DrawWrapper.prototype.setEffect = function (effect, defines, resetContext) {
        var _a;
        if (resetContext === void 0) { resetContext = true; }
        this.effect = effect;
        if (defines !== undefined) {
            this.defines = defines;
        }
        if (resetContext) {
            (_a = this.drawContext) === null || _a === void 0 ? void 0 : _a.reset();
        }
    };
    DrawWrapper.prototype.dispose = function () {
        var _a;
        (_a = this.drawContext) === null || _a === void 0 ? void 0 : _a.dispose();
    };
    return DrawWrapper;
}());
export { DrawWrapper };
//# sourceMappingURL=drawWrapper.js.map