import { __decorate, __extends } from "tslib";
import { Texture } from "../Materials/Textures/texture.js";
import { PostProcess } from "./postProcess.js";
import "../Shaders/refraction.fragment.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { SerializationHelper, serialize } from "../Misc/decorators.js";
/**
 * Post process which applies a refraction texture
 * @see https://doc.babylonjs.com/how_to/how_to_use_postprocesses#refraction
 */
var RefractionPostProcess = /** @class */ (function (_super) {
    __extends(RefractionPostProcess, _super);
    /**
     * Initializes the RefractionPostProcess
     * @see https://doc.babylonjs.com/how_to/how_to_use_postprocesses#refraction
     * @param name The name of the effect.
     * @param refractionTextureUrl Url of the refraction texture to use
     * @param color the base color of the refraction (used to taint the rendering)
     * @param depth simulated refraction depth
     * @param colorLevel the coefficient of the base color (0 to remove base color tainting)
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     */
    function RefractionPostProcess(name, refractionTextureUrl, color, depth, colorLevel, options, camera, samplingMode, engine, reusable) {
        var _this = _super.call(this, name, "refraction", ["baseColor", "depth", "colorLevel"], ["refractionSampler"], options, camera, samplingMode, engine, reusable) || this;
        _this._ownRefractionTexture = true;
        _this.color = color;
        _this.depth = depth;
        _this.colorLevel = colorLevel;
        _this.refractionTextureUrl = refractionTextureUrl;
        _this.onActivateObservable.add(function (cam) {
            _this._refTexture = _this._refTexture || new Texture(refractionTextureUrl, cam.getScene());
        });
        _this.onApplyObservable.add(function (effect) {
            effect.setColor3("baseColor", _this.color);
            effect.setFloat("depth", _this.depth);
            effect.setFloat("colorLevel", _this.colorLevel);
            effect.setTexture("refractionSampler", _this._refTexture);
        });
        return _this;
    }
    Object.defineProperty(RefractionPostProcess.prototype, "refractionTexture", {
        /**
         * Gets or sets the refraction texture
         * Please note that you are responsible for disposing the texture if you set it manually
         */
        get: function () {
            return this._refTexture;
        },
        set: function (value) {
            if (this._refTexture && this._ownRefractionTexture) {
                this._refTexture.dispose();
            }
            this._refTexture = value;
            this._ownRefractionTexture = false;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets a string identifying the name of the class
     * @returns "RefractionPostProcess" string
     */
    RefractionPostProcess.prototype.getClassName = function () {
        return "RefractionPostProcess";
    };
    // Methods
    /**
     * Disposes of the post process
     * @param camera Camera to dispose post process on
     */
    RefractionPostProcess.prototype.dispose = function (camera) {
        if (this._refTexture && this._ownRefractionTexture) {
            this._refTexture.dispose();
            this._refTexture = null;
        }
        _super.prototype.dispose.call(this, camera);
    };
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    RefractionPostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new RefractionPostProcess(parsedPostProcess.name, parsedPostProcess.refractionTextureUrl, parsedPostProcess.color, parsedPostProcess.depth, parsedPostProcess.colorLevel, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], RefractionPostProcess.prototype, "color", void 0);
    __decorate([
        serialize()
    ], RefractionPostProcess.prototype, "depth", void 0);
    __decorate([
        serialize()
    ], RefractionPostProcess.prototype, "colorLevel", void 0);
    __decorate([
        serialize()
    ], RefractionPostProcess.prototype, "refractionTextureUrl", void 0);
    return RefractionPostProcess;
}(PostProcess));
export { RefractionPostProcess };
RegisterClass("BABYLON.RefractionPostProcess", RefractionPostProcess);
//# sourceMappingURL=refractionPostProcess.js.map