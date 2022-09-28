import { __extends } from "tslib";
import { EngineStore } from "../../../Engines/engineStore.js";
import { ProceduralTexture } from "./proceduralTexture.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import "../../../Shaders/noise.fragment.js";
/**
 * Class used to generate noise procedural textures
 */
var NoiseProceduralTexture = /** @class */ (function (_super) {
    __extends(NoiseProceduralTexture, _super);
    /**
     * Creates a new NoiseProceduralTexture
     * @param name defines the name fo the texture
     * @param size defines the size of the texture (default is 256)
     * @param scene defines the hosting scene
     * @param fallbackTexture defines the texture to use if the NoiseProceduralTexture can't be created
     * @param generateMipMaps defines if mipmaps must be generated (true by default)
     */
    function NoiseProceduralTexture(name, size, scene, fallbackTexture, generateMipMaps) {
        if (size === void 0) { size = 256; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        var _this = _super.call(this, name, size, "noise", scene, fallbackTexture, generateMipMaps) || this;
        /** Gets or sets the start time (default is 0) */
        _this.time = 0.0;
        /** Gets or sets a value between 0 and 1 indicating the overall brightness of the texture (default is 0.2) */
        _this.brightness = 0.2;
        /** Defines the number of octaves to process */
        _this.octaves = 3;
        /** Defines the level of persistence (0.8 by default) */
        _this.persistence = 0.8;
        /** Gets or sets animation speed factor (default is 1) */
        _this.animationSpeedFactor = 1;
        _this.autoClear = false;
        _this._updateShaderUniforms();
        return _this;
    }
    NoiseProceduralTexture.prototype._updateShaderUniforms = function () {
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        this.time += scene.getAnimationRatio() * this.animationSpeedFactor * 0.01;
        this.setFloat("brightness", this.brightness);
        this.setFloat("persistence", this.persistence);
        this.setFloat("timeScale", this.time);
    };
    NoiseProceduralTexture.prototype._getDefines = function () {
        return "#define OCTAVES " + (this.octaves | 0);
    };
    /**
     * Generate the current state of the procedural texture
     * @param useCameraPostProcess
     */
    NoiseProceduralTexture.prototype.render = function (useCameraPostProcess) {
        this._updateShaderUniforms();
        _super.prototype.render.call(this, useCameraPostProcess);
    };
    /**
     * Serializes this noise procedural texture
     * @returns a serialized noise procedural texture object
     */
    NoiseProceduralTexture.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.customType = "BABYLON.NoiseProceduralTexture";
        serializationObject.brightness = this.brightness;
        serializationObject.octaves = this.octaves;
        serializationObject.persistence = this.persistence;
        serializationObject.animationSpeedFactor = this.animationSpeedFactor;
        serializationObject.size = this.getSize().width;
        serializationObject.generateMipMaps = this._generateMipMaps;
        serializationObject.time = this.time;
        return serializationObject;
    };
    /**
     * Clone the texture.
     * @returns the cloned texture
     */
    NoiseProceduralTexture.prototype.clone = function () {
        var textureSize = this.getSize();
        var newTexture = new NoiseProceduralTexture(this.name, textureSize.width, this.getScene(), this._fallbackTexture ? this._fallbackTexture : undefined, this._generateMipMaps);
        // Base texture
        newTexture.hasAlpha = this.hasAlpha;
        newTexture.level = this.level;
        // RenderTarget Texture
        newTexture.coordinatesMode = this.coordinatesMode;
        // Noise Specifics
        newTexture.brightness = this.brightness;
        newTexture.octaves = this.octaves;
        newTexture.persistence = this.persistence;
        newTexture.animationSpeedFactor = this.animationSpeedFactor;
        newTexture.time = this.time;
        return newTexture;
    };
    /**
     * Creates a NoiseProceduralTexture from parsed noise procedural texture data
     * @param parsedTexture defines parsed texture data
     * @param scene defines the current scene
     * @returns a parsed NoiseProceduralTexture
     */
    NoiseProceduralTexture.Parse = function (parsedTexture, scene) {
        var _a;
        var texture = new NoiseProceduralTexture(parsedTexture.name, parsedTexture.size, scene, undefined, parsedTexture.generateMipMaps);
        texture.brightness = parsedTexture.brightness;
        texture.octaves = parsedTexture.octaves;
        texture.persistence = parsedTexture.persistence;
        texture.animationSpeedFactor = parsedTexture.animationSpeedFactor;
        texture.time = (_a = parsedTexture.time) !== null && _a !== void 0 ? _a : 0;
        return texture;
    };
    return NoiseProceduralTexture;
}(ProceduralTexture));
export { NoiseProceduralTexture };
RegisterClass("BABYLON.NoiseProceduralTexture", NoiseProceduralTexture);
//# sourceMappingURL=noiseProceduralTexture.js.map