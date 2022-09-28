import { __extends } from "tslib";
import { MultiRenderTarget } from "./multiRenderTarget.js";
import { ImageProcessingPostProcess } from "../../PostProcesses/imageProcessingPostProcess.js";
/**
 * A multi render target designed to render the prepass.
 * Prepass is a scene component used to render information in multiple textures
 * alongside with the scene materials rendering.
 * Note : This is an internal class, and you should NOT need to instanciate this.
 * Only the `PrePassRenderer` should instanciate this class.
 * It is more likely that you need a regular `MultiRenderTarget`
 * @hidden
 */
var PrePassRenderTarget = /** @class */ (function (_super) {
    __extends(PrePassRenderTarget, _super);
    function PrePassRenderTarget(name, renderTargetTexture, size, count, scene, options) {
        var _this = _super.call(this, name, size, count, scene, options) || this;
        /**
         * @hidden
         */
        _this._beforeCompositionPostProcesses = [];
        /**
         * @hidden
         */
        _this._internalTextureDirty = false;
        /**
         * Is this render target enabled for prepass rendering
         */
        _this.enabled = false;
        /**
         * Render target associated with this prePassRenderTarget
         * If this is `null`, it means this prePassRenderTarget is associated with the scene
         */
        _this.renderTargetTexture = null;
        _this.renderTargetTexture = renderTargetTexture;
        return _this;
    }
    /**
     * Creates a composition effect for this RT
     * @hidden
     */
    PrePassRenderTarget.prototype._createCompositionEffect = function () {
        this.imageProcessingPostProcess = new ImageProcessingPostProcess("prePassComposition", 1, null, undefined, this._engine);
        this.imageProcessingPostProcess._updateParameters();
    };
    /**
     * Checks that the size of this RT is still adapted to the desired render size.
     * @hidden
     */
    PrePassRenderTarget.prototype._checkSize = function () {
        var requiredWidth = this._engine.getRenderWidth(true);
        var requiredHeight = this._engine.getRenderHeight(true);
        var width = this.getRenderWidth();
        var height = this.getRenderHeight();
        if (width !== requiredWidth || height !== requiredHeight) {
            this.resize({ width: requiredWidth, height: requiredHeight });
            this._internalTextureDirty = true;
        }
    };
    /**
     * Changes the number of render targets in this MRT
     * Be careful as it will recreate all the data in the new texture.
     * @param count new texture count
     * @param options Specifies texture types and sampling modes for new textures
     * @param textureNames Specifies the names of the textures (optional)
     */
    PrePassRenderTarget.prototype.updateCount = function (count, options, textureNames) {
        _super.prototype.updateCount.call(this, count, options, textureNames);
        this._internalTextureDirty = true;
    };
    /**
     * Resets the post processes chains applied to this RT.
     * @hidden
     */
    PrePassRenderTarget.prototype._resetPostProcessChain = function () {
        this._beforeCompositionPostProcesses = [];
    };
    /**
     * Diposes this render target
     */
    PrePassRenderTarget.prototype.dispose = function () {
        var scene = this._scene;
        _super.prototype.dispose.call(this);
        if (scene && scene.prePassRenderer) {
            var index = scene.prePassRenderer.renderTargets.indexOf(this);
            if (index !== -1) {
                scene.prePassRenderer.renderTargets.splice(index, 1);
            }
        }
        if (this.imageProcessingPostProcess) {
            this.imageProcessingPostProcess.dispose();
        }
        if (this.renderTargetTexture) {
            this.renderTargetTexture._prePassRenderTarget = null;
        }
        if (this._outputPostProcess) {
            this._outputPostProcess.autoClear = true;
            this._outputPostProcess.restoreDefaultInputTexture();
        }
    };
    return PrePassRenderTarget;
}(MultiRenderTarget));
export { PrePassRenderTarget };
//# sourceMappingURL=prePassRenderTarget.js.map