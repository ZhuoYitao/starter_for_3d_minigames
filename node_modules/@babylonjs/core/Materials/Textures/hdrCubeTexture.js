import { __extends } from "tslib";
import { Matrix, Vector3 } from "../../Maths/math.vector.js";
import { BaseTexture } from "../../Materials/Textures/baseTexture.js";
import { Texture } from "../../Materials/Textures/texture.js";

import { HDRTools } from "../../Misc/HighDynamicRange/hdr.js";
import { CubeMapToSphericalPolynomialTools } from "../../Misc/HighDynamicRange/cubemapToSphericalPolynomial.js";
import { RegisterClass } from "../../Misc/typeStore.js";
import { Observable } from "../../Misc/observable.js";
import { Tools } from "../../Misc/tools.js";
import { ToGammaSpace } from "../../Maths/math.constants.js";
import { HDRFiltering } from "../../Materials/Textures/Filtering/hdrFiltering.js";
import { ToHalfFloat } from "../../Misc/textureTools.js";
import "../../Engines/Extensions/engine.rawTexture.js";
import "../../Materials/Textures/baseTexture.polynomial.js";
/**
 * This represents a texture coming from an HDR input.
 *
 * The only supported format is currently panorama picture stored in RGBE format.
 * Example of such files can be found on Poly Haven: https://polyhaven.com/hdris
 */
var HDRCubeTexture = /** @class */ (function (_super) {
    __extends(HDRCubeTexture, _super);
    /**
     * Instantiates an HDRTexture from the following parameters.
     *
     * @param url The location of the HDR raw data (Panorama stored in RGBE format)
     * @param sceneOrEngine The scene or engine the texture will be used in
     * @param size The cubemap desired size (the more it increases the longer the generation will be)
     * @param noMipmap Forces to not generate the mipmap if true
     * @param generateHarmonics Specifies whether you want to extract the polynomial harmonics during the generation process
     * @param gammaSpace Specifies if the texture will be use in gamma or linear space (the PBR material requires those texture in linear space, but the standard material would require them in Gamma space)
     * @param prefilterOnLoad Prefilters HDR texture to allow use of this texture as a PBR reflection texture.
     * @param onLoad
     * @param onError
     */
    function HDRCubeTexture(url, sceneOrEngine, size, noMipmap, generateHarmonics, gammaSpace, prefilterOnLoad, onLoad, onError) {
        if (noMipmap === void 0) { noMipmap = false; }
        if (generateHarmonics === void 0) { generateHarmonics = true; }
        if (gammaSpace === void 0) { gammaSpace = false; }
        if (prefilterOnLoad === void 0) { prefilterOnLoad = false; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        var _this = this;
        var _a;
        _this = _super.call(this, sceneOrEngine) || this;
        _this._generateHarmonics = true;
        _this._onError = null;
        _this._isBlocking = true;
        _this._rotationY = 0;
        /**
         * Gets or sets the center of the bounding box associated with the cube texture
         * It must define where the camera used to render the texture was set
         */
        _this.boundingBoxPosition = Vector3.Zero();
        /**
         * Observable triggered once the texture has been loaded.
         */
        _this.onLoadObservable = new Observable();
        if (!url) {
            return _this;
        }
        _this._coordinatesMode = Texture.CUBIC_MODE;
        _this.name = url;
        _this.url = url;
        _this.hasAlpha = false;
        _this.isCube = true;
        _this._textureMatrix = Matrix.Identity();
        _this._prefilterOnLoad = prefilterOnLoad;
        _this._onLoad = function () {
            _this.onLoadObservable.notifyObservers(_this);
            if (onLoad) {
                onLoad();
            }
        };
        _this._onError = onError;
        _this.gammaSpace = gammaSpace;
        _this._noMipmap = noMipmap;
        _this._size = size;
        _this._generateHarmonics = generateHarmonics;
        _this._texture = _this._getFromCache(url, _this._noMipmap);
        if (!_this._texture) {
            if (!((_a = _this.getScene()) === null || _a === void 0 ? void 0 : _a.useDelayedTextureLoading)) {
                _this._loadTexture();
            }
            else {
                _this.delayLoadState = 4;
            }
        }
        else {
            if (_this._texture.isReady) {
                Tools.SetImmediate(function () { return _this._onLoad(); });
            }
            else {
                _this._texture.onLoadedObservable.add(_this._onLoad);
            }
        }
        return _this;
    }
    Object.defineProperty(HDRCubeTexture.prototype, "isBlocking", {
        /**
         * Gets whether or not the texture is blocking during loading.
         */
        get: function () {
            return this._isBlocking;
        },
        /**
         * Sets whether or not the texture is blocking during loading.
         */
        set: function (value) {
            this._isBlocking = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HDRCubeTexture.prototype, "rotationY", {
        /**
         * Gets texture matrix rotation angle around Y axis radians.
         */
        get: function () {
            return this._rotationY;
        },
        /**
         * Sets texture matrix rotation angle around Y axis in radians.
         */
        set: function (value) {
            this._rotationY = value;
            this.setReflectionTextureMatrix(Matrix.RotationY(this._rotationY));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HDRCubeTexture.prototype, "boundingBoxSize", {
        get: function () {
            return this._boundingBoxSize;
        },
        /**
         * Gets or sets the size of the bounding box associated with the cube texture
         * When defined, the cubemap will switch to local mode
         * @see https://community.arm.com/graphics/b/blog/posts/reflections-based-on-local-cubemaps-in-unity
         * @example https://www.babylonjs-playground.com/#RNASML
         */
        set: function (value) {
            if (this._boundingBoxSize && this._boundingBoxSize.equals(value)) {
                return;
            }
            this._boundingBoxSize = value;
            var scene = this.getScene();
            if (scene) {
                scene.markAllMaterialsAsDirty(1);
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the current class name of the texture useful for serialization or dynamic coding.
     * @returns "HDRCubeTexture"
     */
    HDRCubeTexture.prototype.getClassName = function () {
        return "HDRCubeTexture";
    };
    /**
     * Occurs when the file is raw .hdr file.
     */
    HDRCubeTexture.prototype._loadTexture = function () {
        var _this = this;
        var engine = this._getEngine();
        var caps = engine.getCaps();
        var textureType = 0;
        if (caps.textureFloat && caps.textureFloatLinearFiltering) {
            textureType = 1;
        }
        else if (caps.textureHalfFloat && caps.textureHalfFloatLinearFiltering) {
            textureType = 2;
        }
        var callback = function (buffer) {
            _this.lodGenerationOffset = 0.0;
            _this.lodGenerationScale = 0.8;
            // Extract the raw linear data.
            var data = HDRTools.GetCubeMapTextureData(buffer, _this._size);
            // Generate harmonics if needed.
            if (_this._generateHarmonics) {
                var sphericalPolynomial = CubeMapToSphericalPolynomialTools.ConvertCubeMapToSphericalPolynomial(data);
                _this.sphericalPolynomial = sphericalPolynomial;
            }
            var results = [];
            var byteArray = null;
            var shortArray = null;
            // Push each faces.
            for (var j = 0; j < 6; j++) {
                // Create fallback array
                if (textureType === 2) {
                    shortArray = new Uint16Array(_this._size * _this._size * 3);
                }
                else if (textureType === 0) {
                    // 3 channels of 1 bytes per pixel in bytes.
                    byteArray = new Uint8Array(_this._size * _this._size * 3);
                }
                var dataFace = data[HDRCubeTexture._FacesMapping[j]];
                // If special cases.
                if (_this.gammaSpace || shortArray || byteArray) {
                    for (var i = 0; i < _this._size * _this._size; i++) {
                        // Put in gamma space if requested.
                        if (_this.gammaSpace) {
                            dataFace[i * 3 + 0] = Math.pow(dataFace[i * 3 + 0], ToGammaSpace);
                            dataFace[i * 3 + 1] = Math.pow(dataFace[i * 3 + 1], ToGammaSpace);
                            dataFace[i * 3 + 2] = Math.pow(dataFace[i * 3 + 2], ToGammaSpace);
                        }
                        // Convert to half float texture for fallback.
                        if (shortArray) {
                            shortArray[i * 3 + 0] = ToHalfFloat(dataFace[i * 3 + 0]);
                            shortArray[i * 3 + 1] = ToHalfFloat(dataFace[i * 3 + 1]);
                            shortArray[i * 3 + 2] = ToHalfFloat(dataFace[i * 3 + 2]);
                        }
                        // Convert to int texture for fallback.
                        if (byteArray) {
                            var r = Math.max(dataFace[i * 3 + 0] * 255, 0);
                            var g = Math.max(dataFace[i * 3 + 1] * 255, 0);
                            var b = Math.max(dataFace[i * 3 + 2] * 255, 0);
                            // May use luminance instead if the result is not accurate.
                            var max = Math.max(Math.max(r, g), b);
                            if (max > 255) {
                                var scale = 255 / max;
                                r *= scale;
                                g *= scale;
                                b *= scale;
                            }
                            byteArray[i * 3 + 0] = r;
                            byteArray[i * 3 + 1] = g;
                            byteArray[i * 3 + 2] = b;
                        }
                    }
                }
                if (shortArray) {
                    results.push(shortArray);
                }
                else if (byteArray) {
                    results.push(byteArray);
                }
                else {
                    results.push(dataFace);
                }
            }
            return results;
        };
        if (engine._features.allowTexturePrefiltering && this._prefilterOnLoad) {
            var previousOnLoad_1 = this._onLoad;
            var hdrFiltering_1 = new HDRFiltering(engine);
            this._onLoad = function () {
                hdrFiltering_1.prefilter(_this, previousOnLoad_1);
            };
        }
        this._texture = engine.createRawCubeTextureFromUrl(this.url, this.getScene(), this._size, 4, textureType, this._noMipmap, callback, null, this._onLoad, this._onError);
    };
    HDRCubeTexture.prototype.clone = function () {
        var newTexture = new HDRCubeTexture(this.url, this.getScene() || this._getEngine(), this._size, this._noMipmap, this._generateHarmonics, this.gammaSpace);
        // Base texture
        newTexture.level = this.level;
        newTexture.wrapU = this.wrapU;
        newTexture.wrapV = this.wrapV;
        newTexture.coordinatesIndex = this.coordinatesIndex;
        newTexture.coordinatesMode = this.coordinatesMode;
        return newTexture;
    };
    // Methods
    HDRCubeTexture.prototype.delayLoad = function () {
        if (this.delayLoadState !== 4) {
            return;
        }
        this.delayLoadState = 1;
        this._texture = this._getFromCache(this.url, this._noMipmap);
        if (!this._texture) {
            this._loadTexture();
        }
    };
    /**
     * Get the texture reflection matrix used to rotate/transform the reflection.
     * @returns the reflection matrix
     */
    HDRCubeTexture.prototype.getReflectionTextureMatrix = function () {
        return this._textureMatrix;
    };
    /**
     * Set the texture reflection matrix used to rotate/transform the reflection.
     * @param value Define the reflection matrix to set
     */
    HDRCubeTexture.prototype.setReflectionTextureMatrix = function (value) {
        var _this = this;
        var _a;
        this._textureMatrix = value;
        if (value.updateFlag === this._textureMatrix.updateFlag) {
            return;
        }
        if (value.isIdentity() !== this._textureMatrix.isIdentity()) {
            (_a = this.getScene()) === null || _a === void 0 ? void 0 : _a.markAllMaterialsAsDirty(1, function (mat) { return mat.getActiveTextures().indexOf(_this) !== -1; });
        }
    };
    /**
     * Dispose the texture and release its associated resources.
     */
    HDRCubeTexture.prototype.dispose = function () {
        this.onLoadObservable.clear();
        _super.prototype.dispose.call(this);
    };
    /**
     * Parses a JSON representation of an HDR Texture in order to create the texture
     * @param parsedTexture Define the JSON representation
     * @param scene Define the scene the texture should be created in
     * @param rootUrl Define the root url in case we need to load relative dependencies
     * @returns the newly created texture after parsing
     */
    HDRCubeTexture.Parse = function (parsedTexture, scene, rootUrl) {
        var texture = null;
        if (parsedTexture.name && !parsedTexture.isRenderTarget) {
            texture = new HDRCubeTexture(rootUrl + parsedTexture.name, scene, parsedTexture.size, parsedTexture.noMipmap, parsedTexture.generateHarmonics, parsedTexture.useInGammaSpace);
            texture.name = parsedTexture.name;
            texture.hasAlpha = parsedTexture.hasAlpha;
            texture.level = parsedTexture.level;
            texture.coordinatesMode = parsedTexture.coordinatesMode;
            texture.isBlocking = parsedTexture.isBlocking;
        }
        if (texture) {
            if (parsedTexture.boundingBoxPosition) {
                texture.boundingBoxPosition = Vector3.FromArray(parsedTexture.boundingBoxPosition);
            }
            if (parsedTexture.boundingBoxSize) {
                texture.boundingBoxSize = Vector3.FromArray(parsedTexture.boundingBoxSize);
            }
            if (parsedTexture.rotationY) {
                texture.rotationY = parsedTexture.rotationY;
            }
        }
        return texture;
    };
    HDRCubeTexture.prototype.serialize = function () {
        if (!this.name) {
            return null;
        }
        var serializationObject = {};
        serializationObject.name = this.name;
        serializationObject.hasAlpha = this.hasAlpha;
        serializationObject.isCube = true;
        serializationObject.level = this.level;
        serializationObject.size = this._size;
        serializationObject.coordinatesMode = this.coordinatesMode;
        serializationObject.useInGammaSpace = this.gammaSpace;
        serializationObject.generateHarmonics = this._generateHarmonics;
        serializationObject.customType = "BABYLON.HDRCubeTexture";
        serializationObject.noMipmap = this._noMipmap;
        serializationObject.isBlocking = this._isBlocking;
        serializationObject.rotationY = this._rotationY;
        return serializationObject;
    };
    HDRCubeTexture._FacesMapping = ["right", "left", "up", "down", "front", "back"];
    return HDRCubeTexture;
}(BaseTexture));
export { HDRCubeTexture };
RegisterClass("BABYLON.HDRCubeTexture", HDRCubeTexture);
//# sourceMappingURL=hdrCubeTexture.js.map