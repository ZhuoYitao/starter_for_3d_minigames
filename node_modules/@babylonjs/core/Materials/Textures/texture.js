import { __decorate, __extends } from "tslib";
import { serialize, SerializationHelper } from "../../Misc/decorators.js";
import { Observable } from "../../Misc/observable.js";
import { Matrix, TmpVectors, Vector3 } from "../../Maths/math.vector.js";
import { BaseTexture } from "../../Materials/Textures/baseTexture.js";

import { GetClass, RegisterClass } from "../../Misc/typeStore.js";
import { _WarnImport } from "../../Misc/devTools.js";
import { TimingTools } from "../../Misc/timingTools.js";
import { InstantiationTools } from "../../Misc/instantiationTools.js";
import { Plane } from "../../Maths/math.plane.js";
import { EncodeArrayBufferToBase64, StartsWith } from "../../Misc/stringTools.js";
import { GenerateBase64StringFromTexture, GenerateBase64StringFromTextureAsync } from "../../Misc/copyTools.js";
import { CompatibilityOptions } from "../../Compat/compatibilityOptions.js";
/**
 * This represents a texture in babylon. It can be easily loaded from a network, base64 or html input.
 * @see https://doc.babylonjs.com/babylon101/materials#texture
 */
var Texture = /** @class */ (function (_super) {
    __extends(Texture, _super);
    /**
     * Instantiates a new texture.
     * This represents a texture in babylon. It can be easily loaded from a network, base64 or html input.
     * @see https://doc.babylonjs.com/babylon101/materials#texture
     * @param url defines the url of the picture to load as a texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param noMipmapOrOptions defines if the texture will require mip maps or not or set of all options to create the texture
     * @param invertY defines if the texture needs to be inverted on the y axis during loading
     * @param samplingMode defines the sampling mode we want for the texture while fetching from it (Texture.NEAREST_SAMPLINGMODE...)
     * @param onLoad defines a callback triggered when the texture has been loaded
     * @param onError defines a callback triggered when an error occurred during the loading session
     * @param buffer defines the buffer to load the texture from in case the texture is loaded from a buffer representation
     * @param deleteBuffer defines if the buffer we are loading the texture from should be deleted after load
     * @param format defines the format of the texture we are trying to load (Engine.TEXTUREFORMAT_RGBA...)
     * @param mimeType defines an optional mime type information
     * @param loaderOptions options to be passed to the loader
     * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
     */
    function Texture(url, sceneOrEngine, noMipmapOrOptions, invertY, samplingMode, onLoad, onError, buffer, deleteBuffer, format, mimeType, loaderOptions, creationFlags) {
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (buffer === void 0) { buffer = null; }
        if (deleteBuffer === void 0) { deleteBuffer = false; }
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        _this = _super.call(this, sceneOrEngine) || this;
        /**
         * Define the url of the texture.
         */
        _this.url = null;
        /**
         * Define an offset on the texture to offset the u coordinates of the UVs
         * @see https://doc.babylonjs.com/how_to/more_materials#offsetting
         */
        _this.uOffset = 0;
        /**
         * Define an offset on the texture to offset the v coordinates of the UVs
         * @see https://doc.babylonjs.com/how_to/more_materials#offsetting
         */
        _this.vOffset = 0;
        /**
         * Define an offset on the texture to scale the u coordinates of the UVs
         * @see https://doc.babylonjs.com/how_to/more_materials#tiling
         */
        _this.uScale = 1.0;
        /**
         * Define an offset on the texture to scale the v coordinates of the UVs
         * @see https://doc.babylonjs.com/how_to/more_materials#tiling
         */
        _this.vScale = 1.0;
        /**
         * Define an offset on the texture to rotate around the u coordinates of the UVs
         * The angle is defined in radians.
         * @see https://doc.babylonjs.com/how_to/more_materials
         */
        _this.uAng = 0;
        /**
         * Define an offset on the texture to rotate around the v coordinates of the UVs
         * The angle is defined in radians.
         * @see https://doc.babylonjs.com/how_to/more_materials
         */
        _this.vAng = 0;
        /**
         * Define an offset on the texture to rotate around the w coordinates of the UVs (in case of 3d texture)
         * The angle is defined in radians.
         * @see https://doc.babylonjs.com/how_to/more_materials
         */
        _this.wAng = 0;
        /**
         * Defines the center of rotation (U)
         */
        _this.uRotationCenter = 0.5;
        /**
         * Defines the center of rotation (V)
         */
        _this.vRotationCenter = 0.5;
        /**
         * Defines the center of rotation (W)
         */
        _this.wRotationCenter = 0.5;
        /**
         * Sets this property to true to avoid deformations when rotating the texture with non-uniform scaling
         */
        _this.homogeneousRotationInUVTransform = false;
        /**
         * List of inspectable custom properties (used by the Inspector)
         * @see https://doc.babylonjs.com/how_to/debug_layer#extensibility
         */
        _this.inspectableCustomProperties = null;
        _this._noMipmap = false;
        /** @hidden */
        _this._invertY = false;
        _this._rowGenerationMatrix = null;
        _this._cachedTextureMatrix = null;
        _this._projectionModeMatrix = null;
        _this._t0 = null;
        _this._t1 = null;
        _this._t2 = null;
        _this._cachedUOffset = -1;
        _this._cachedVOffset = -1;
        _this._cachedUScale = 0;
        _this._cachedVScale = 0;
        _this._cachedUAng = -1;
        _this._cachedVAng = -1;
        _this._cachedWAng = -1;
        _this._cachedProjectionMatrixId = -1;
        _this._cachedURotationCenter = -1;
        _this._cachedVRotationCenter = -1;
        _this._cachedWRotationCenter = -1;
        _this._cachedHomogeneousRotationInUVTransform = false;
        _this._cachedCoordinatesMode = -1;
        /** @hidden */
        _this._buffer = null;
        _this._deleteBuffer = false;
        _this._format = null;
        _this._delayedOnLoad = null;
        _this._delayedOnError = null;
        /**
         * Observable triggered once the texture has been loaded.
         */
        _this.onLoadObservable = new Observable();
        _this._isBlocking = true;
        _this.name = url || "";
        _this.url = url;
        var noMipmap;
        var useSRGBBuffer = false;
        var internalTexture = null;
        if (typeof noMipmapOrOptions === "object" && noMipmapOrOptions !== null) {
            noMipmap = (_a = noMipmapOrOptions.noMipmap) !== null && _a !== void 0 ? _a : false;
            invertY = (_b = noMipmapOrOptions.invertY) !== null && _b !== void 0 ? _b : (CompatibilityOptions.UseOpenGLOrientationForUV ? false : true);
            samplingMode = (_c = noMipmapOrOptions.samplingMode) !== null && _c !== void 0 ? _c : Texture.TRILINEAR_SAMPLINGMODE;
            onLoad = (_d = noMipmapOrOptions.onLoad) !== null && _d !== void 0 ? _d : null;
            onError = (_e = noMipmapOrOptions.onError) !== null && _e !== void 0 ? _e : null;
            buffer = (_f = noMipmapOrOptions.buffer) !== null && _f !== void 0 ? _f : null;
            deleteBuffer = (_g = noMipmapOrOptions.deleteBuffer) !== null && _g !== void 0 ? _g : false;
            format = noMipmapOrOptions.format;
            mimeType = noMipmapOrOptions.mimeType;
            loaderOptions = noMipmapOrOptions.loaderOptions;
            creationFlags = noMipmapOrOptions.creationFlags;
            useSRGBBuffer = (_h = noMipmapOrOptions.useSRGBBuffer) !== null && _h !== void 0 ? _h : false;
            internalTexture = (_j = noMipmapOrOptions.internalTexture) !== null && _j !== void 0 ? _j : null;
        }
        else {
            noMipmap = !!noMipmapOrOptions;
        }
        _this._noMipmap = noMipmap;
        _this._invertY = invertY === undefined ? (CompatibilityOptions.UseOpenGLOrientationForUV ? false : true) : invertY;
        _this._initialSamplingMode = samplingMode;
        _this._buffer = buffer;
        _this._deleteBuffer = deleteBuffer;
        _this._mimeType = mimeType;
        _this._loaderOptions = loaderOptions;
        _this._creationFlags = creationFlags;
        _this._useSRGBBuffer = useSRGBBuffer;
        if (format) {
            _this._format = format;
        }
        var scene = _this.getScene();
        var engine = _this._getEngine();
        if (!engine) {
            return _this;
        }
        engine.onBeforeTextureInitObservable.notifyObservers(_this);
        var load = function () {
            if (_this._texture) {
                if (_this._texture._invertVScale) {
                    _this.vScale *= -1;
                    _this.vOffset += 1;
                }
                // Update texture to match internal texture's wrapping
                if (_this._texture._cachedWrapU !== null) {
                    _this.wrapU = _this._texture._cachedWrapU;
                    _this._texture._cachedWrapU = null;
                }
                if (_this._texture._cachedWrapV !== null) {
                    _this.wrapV = _this._texture._cachedWrapV;
                    _this._texture._cachedWrapV = null;
                }
                if (_this._texture._cachedWrapR !== null) {
                    _this.wrapR = _this._texture._cachedWrapR;
                    _this._texture._cachedWrapR = null;
                }
            }
            if (_this.onLoadObservable.hasObservers()) {
                _this.onLoadObservable.notifyObservers(_this);
            }
            if (onLoad) {
                onLoad();
            }
            if (!_this.isBlocking && scene) {
                scene.resetCachedMaterial();
            }
        };
        var errorHandler = function (message, exception) {
            _this._loadingError = true;
            _this._errorObject = { message: message, exception: exception };
            if (onError) {
                onError(message, exception);
            }
            Texture.OnTextureLoadErrorObservable.notifyObservers(_this);
        };
        if (!_this.url) {
            _this._delayedOnLoad = load;
            _this._delayedOnError = errorHandler;
            return _this;
        }
        _this._texture = internalTexture !== null && internalTexture !== void 0 ? internalTexture : _this._getFromCache(_this.url, noMipmap, samplingMode, _this._invertY, useSRGBBuffer);
        if (!_this._texture) {
            if (!scene || !scene.useDelayedTextureLoading) {
                try {
                    _this._texture = engine.createTexture(_this.url, noMipmap, _this._invertY, scene, samplingMode, load, errorHandler, _this._buffer, undefined, _this._format, null, mimeType, loaderOptions, creationFlags, useSRGBBuffer);
                }
                catch (e) {
                    errorHandler("error loading", e);
                    throw e;
                }
                if (deleteBuffer) {
                    _this._buffer = null;
                }
            }
            else {
                _this.delayLoadState = 4;
                _this._delayedOnLoad = load;
                _this._delayedOnError = errorHandler;
            }
        }
        else {
            if (_this._texture.isReady) {
                TimingTools.SetImmediate(function () { return load(); });
            }
            else {
                var loadObserver_1 = _this._texture.onLoadedObservable.add(load);
                _this._texture.onErrorObservable.add(function (e) {
                    var _a;
                    errorHandler(e.message, e.exception);
                    (_a = _this._texture) === null || _a === void 0 ? void 0 : _a.onLoadedObservable.remove(loadObserver_1);
                });
            }
        }
        return _this;
    }
    Object.defineProperty(Texture.prototype, "noMipmap", {
        /**
         * Are mip maps generated for this texture or not.
         */
        get: function () {
            return this._noMipmap;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Texture.prototype, "mimeType", {
        /** Returns the texture mime type if it was defined by a loader (undefined else) */
        get: function () {
            return this._mimeType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Texture.prototype, "isBlocking", {
        get: function () {
            return this._isBlocking;
        },
        /**
         * Is the texture preventing material to render while loading.
         * If false, a default texture will be used instead of the loading one during the preparation step.
         */
        set: function (value) {
            this._isBlocking = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Texture.prototype, "invertY", {
        /**
         * Gets a boolean indicating if the texture needs to be inverted on the y axis during loading
         */
        get: function () {
            return this._invertY;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Update the url (and optional buffer) of this texture if url was null during construction.
     * @param url the url of the texture
     * @param buffer the buffer of the texture (defaults to null)
     * @param onLoad callback called when the texture is loaded  (defaults to null)
     */
    Texture.prototype.updateURL = function (url, buffer, onLoad) {
        if (buffer === void 0) { buffer = null; }
        if (this.url) {
            this.releaseInternalTexture();
            this.getScene().markAllMaterialsAsDirty(1);
        }
        if (!this.name || StartsWith(this.name, "data:")) {
            this.name = url;
        }
        this.url = url;
        this._buffer = buffer;
        this.delayLoadState = 4;
        if (onLoad) {
            this._delayedOnLoad = onLoad;
        }
        this.delayLoad();
    };
    /**
     * Finish the loading sequence of a texture flagged as delayed load.
     * @hidden
     */
    Texture.prototype.delayLoad = function () {
        if (this.delayLoadState !== 4) {
            return;
        }
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        this.delayLoadState = 1;
        this._texture = this._getFromCache(this.url, this._noMipmap, this.samplingMode, this._invertY, this._useSRGBBuffer);
        if (!this._texture) {
            this._texture = scene
                .getEngine()
                .createTexture(this.url, this._noMipmap, this._invertY, scene, this.samplingMode, this._delayedOnLoad, this._delayedOnError, this._buffer, null, this._format, null, this._mimeType, this._loaderOptions, this._creationFlags, this._useSRGBBuffer);
            if (this._deleteBuffer) {
                this._buffer = null;
            }
        }
        else {
            if (this._delayedOnLoad) {
                if (this._texture.isReady) {
                    TimingTools.SetImmediate(this._delayedOnLoad);
                }
                else {
                    this._texture.onLoadedObservable.add(this._delayedOnLoad);
                }
            }
        }
        this._delayedOnLoad = null;
        this._delayedOnError = null;
    };
    Texture.prototype._prepareRowForTextureGeneration = function (x, y, z, t) {
        x *= this._cachedUScale;
        y *= this._cachedVScale;
        x -= this.uRotationCenter * this._cachedUScale;
        y -= this.vRotationCenter * this._cachedVScale;
        z -= this.wRotationCenter;
        Vector3.TransformCoordinatesFromFloatsToRef(x, y, z, this._rowGenerationMatrix, t);
        t.x += this.uRotationCenter * this._cachedUScale + this._cachedUOffset;
        t.y += this.vRotationCenter * this._cachedVScale + this._cachedVOffset;
        t.z += this.wRotationCenter;
    };
    /**
     * Checks if the texture has the same transform matrix than another texture
     * @param texture texture to check against
     * @returns true if the transforms are the same, else false
     */
    Texture.prototype.checkTransformsAreIdentical = function (texture) {
        return (texture !== null &&
            this.uOffset === texture.uOffset &&
            this.vOffset === texture.vOffset &&
            this.uScale === texture.uScale &&
            this.vScale === texture.vScale &&
            this.uAng === texture.uAng &&
            this.vAng === texture.vAng &&
            this.wAng === texture.wAng);
    };
    /**
     * Get the current texture matrix which includes the requested offsetting, tiling and rotation components.
     * @param uBase
     * @returns the transform matrix of the texture.
     */
    Texture.prototype.getTextureMatrix = function (uBase) {
        var _this = this;
        if (uBase === void 0) { uBase = 1; }
        if (this.uOffset === this._cachedUOffset &&
            this.vOffset === this._cachedVOffset &&
            this.uScale * uBase === this._cachedUScale &&
            this.vScale === this._cachedVScale &&
            this.uAng === this._cachedUAng &&
            this.vAng === this._cachedVAng &&
            this.wAng === this._cachedWAng &&
            this.uRotationCenter === this._cachedURotationCenter &&
            this.vRotationCenter === this._cachedVRotationCenter &&
            this.wRotationCenter === this._cachedWRotationCenter &&
            this.homogeneousRotationInUVTransform === this._cachedHomogeneousRotationInUVTransform) {
            return this._cachedTextureMatrix;
        }
        this._cachedUOffset = this.uOffset;
        this._cachedVOffset = this.vOffset;
        this._cachedUScale = this.uScale * uBase;
        this._cachedVScale = this.vScale;
        this._cachedUAng = this.uAng;
        this._cachedVAng = this.vAng;
        this._cachedWAng = this.wAng;
        this._cachedURotationCenter = this.uRotationCenter;
        this._cachedVRotationCenter = this.vRotationCenter;
        this._cachedWRotationCenter = this.wRotationCenter;
        this._cachedHomogeneousRotationInUVTransform = this.homogeneousRotationInUVTransform;
        if (!this._cachedTextureMatrix || !this._rowGenerationMatrix) {
            this._cachedTextureMatrix = Matrix.Zero();
            this._rowGenerationMatrix = new Matrix();
            this._t0 = Vector3.Zero();
            this._t1 = Vector3.Zero();
            this._t2 = Vector3.Zero();
        }
        Matrix.RotationYawPitchRollToRef(this.vAng, this.uAng, this.wAng, this._rowGenerationMatrix);
        if (this.homogeneousRotationInUVTransform) {
            Matrix.TranslationToRef(-this._cachedURotationCenter, -this._cachedVRotationCenter, -this._cachedWRotationCenter, TmpVectors.Matrix[0]);
            Matrix.TranslationToRef(this._cachedURotationCenter, this._cachedVRotationCenter, this._cachedWRotationCenter, TmpVectors.Matrix[1]);
            Matrix.ScalingToRef(this._cachedUScale, this._cachedVScale, 0, TmpVectors.Matrix[2]);
            Matrix.TranslationToRef(this._cachedUOffset, this._cachedVOffset, 0, TmpVectors.Matrix[3]);
            TmpVectors.Matrix[0].multiplyToRef(this._rowGenerationMatrix, this._cachedTextureMatrix);
            this._cachedTextureMatrix.multiplyToRef(TmpVectors.Matrix[1], this._cachedTextureMatrix);
            this._cachedTextureMatrix.multiplyToRef(TmpVectors.Matrix[2], this._cachedTextureMatrix);
            this._cachedTextureMatrix.multiplyToRef(TmpVectors.Matrix[3], this._cachedTextureMatrix);
            // copy the translation row to the 3rd row of the matrix so that we don't need to update the shaders (which expects the translation to be on the 3rd row)
            this._cachedTextureMatrix.setRowFromFloats(2, this._cachedTextureMatrix.m[12], this._cachedTextureMatrix.m[13], this._cachedTextureMatrix.m[14], 1);
        }
        else {
            this._prepareRowForTextureGeneration(0, 0, 0, this._t0);
            this._prepareRowForTextureGeneration(1.0, 0, 0, this._t1);
            this._prepareRowForTextureGeneration(0, 1.0, 0, this._t2);
            this._t1.subtractInPlace(this._t0);
            this._t2.subtractInPlace(this._t0);
            Matrix.FromValuesToRef(this._t1.x, this._t1.y, this._t1.z, 0.0, this._t2.x, this._t2.y, this._t2.z, 0.0, this._t0.x, this._t0.y, this._t0.z, 0.0, 0.0, 0.0, 0.0, 1.0, this._cachedTextureMatrix);
        }
        var scene = this.getScene();
        if (!scene) {
            return this._cachedTextureMatrix;
        }
        // We flag the materials that are using this texture as "texture dirty" because depending on the fact that the matrix is the identity or not, some defines
        // will get different values (see MaterialHelper.PrepareDefinesForMergedUV), meaning we should regenerate the effect accordingly
        scene.markAllMaterialsAsDirty(1, function (mat) {
            return mat.hasTexture(_this);
        });
        return this._cachedTextureMatrix;
    };
    /**
     * Get the current matrix used to apply reflection. This is useful to rotate an environment texture for instance.
     * @returns The reflection texture transform
     */
    Texture.prototype.getReflectionTextureMatrix = function () {
        var _this = this;
        var scene = this.getScene();
        if (!scene) {
            return this._cachedTextureMatrix;
        }
        if (this.uOffset === this._cachedUOffset &&
            this.vOffset === this._cachedVOffset &&
            this.uScale === this._cachedUScale &&
            this.vScale === this._cachedVScale &&
            this.coordinatesMode === this._cachedCoordinatesMode) {
            if (this.coordinatesMode === Texture.PROJECTION_MODE) {
                if (this._cachedProjectionMatrixId === scene.getProjectionMatrix().updateFlag) {
                    return this._cachedTextureMatrix;
                }
            }
            else {
                return this._cachedTextureMatrix;
            }
        }
        if (!this._cachedTextureMatrix) {
            this._cachedTextureMatrix = Matrix.Zero();
        }
        if (!this._projectionModeMatrix) {
            this._projectionModeMatrix = Matrix.Zero();
        }
        var flagMaterialsAsTextureDirty = this._cachedCoordinatesMode !== this.coordinatesMode;
        this._cachedUOffset = this.uOffset;
        this._cachedVOffset = this.vOffset;
        this._cachedUScale = this.uScale;
        this._cachedVScale = this.vScale;
        this._cachedCoordinatesMode = this.coordinatesMode;
        switch (this.coordinatesMode) {
            case Texture.PLANAR_MODE: {
                Matrix.IdentityToRef(this._cachedTextureMatrix);
                this._cachedTextureMatrix[0] = this.uScale;
                this._cachedTextureMatrix[5] = this.vScale;
                this._cachedTextureMatrix[12] = this.uOffset;
                this._cachedTextureMatrix[13] = this.vOffset;
                break;
            }
            case Texture.PROJECTION_MODE: {
                Matrix.FromValuesToRef(0.5, 0.0, 0.0, 0.0, 0.0, -0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.5, 1.0, 1.0, this._projectionModeMatrix);
                var projectionMatrix = scene.getProjectionMatrix();
                this._cachedProjectionMatrixId = projectionMatrix.updateFlag;
                projectionMatrix.multiplyToRef(this._projectionModeMatrix, this._cachedTextureMatrix);
                break;
            }
            default:
                Matrix.IdentityToRef(this._cachedTextureMatrix);
                break;
        }
        if (flagMaterialsAsTextureDirty) {
            // We flag the materials that are using this texture as "texture dirty" if the coordinatesMode has changed.
            // Indeed, this property is used to set the value of some defines used to generate the effect (in material.isReadyForSubMesh), so we must make sure this code will be re-executed and the effect recreated if necessary
            scene.markAllMaterialsAsDirty(1, function (mat) {
                return mat.getActiveTextures().indexOf(_this) !== -1;
            });
        }
        return this._cachedTextureMatrix;
    };
    /**
     * Clones the texture.
     * @returns the cloned texture
     */
    Texture.prototype.clone = function () {
        var _this = this;
        var options = {
            noMipmap: this._noMipmap,
            invertY: this._invertY,
            samplingMode: this.samplingMode,
            onLoad: undefined,
            onError: undefined,
            buffer: this._texture ? this._texture._buffer : undefined,
            deleteBuffer: this._deleteBuffer,
            format: this.textureFormat,
            mimeType: this.mimeType,
            loaderOptions: this._loaderOptions,
            creationFlags: this._creationFlags,
            useSRGBBuffer: this._useSRGBBuffer,
        };
        return SerializationHelper.Clone(function () {
            return new Texture(_this._texture ? _this._texture.url : null, _this.getScene(), options);
        }, this);
    };
    /**
     * Serialize the texture to a JSON representation we can easily use in the respective Parse function.
     * @returns The JSON representation of the texture
     */
    Texture.prototype.serialize = function () {
        var savedName = this.name;
        if (!Texture.SerializeBuffers) {
            if (StartsWith(this.name, "data:")) {
                this.name = "";
            }
        }
        if (StartsWith(this.name, "data:") && this.url === this.name) {
            this.url = "";
        }
        var serializationObject = _super.prototype.serialize.call(this);
        if (!serializationObject) {
            return null;
        }
        if (Texture.SerializeBuffers || Texture.ForceSerializeBuffers) {
            if (typeof this._buffer === "string" && this._buffer.substr(0, 5) === "data:") {
                serializationObject.base64String = this._buffer;
                serializationObject.name = serializationObject.name.replace("data:", "");
            }
            else if (this.url && StartsWith(this.url, "data:") && this._buffer instanceof Uint8Array) {
                serializationObject.base64String = "data:image/png;base64," + EncodeArrayBufferToBase64(this._buffer);
            }
            else if (Texture.ForceSerializeBuffers || (this.url && StartsWith(this.url, "blob:")) || this._forceSerialize) {
                serializationObject.base64String =
                    !this._engine || this._engine._features.supportSyncTextureRead ? GenerateBase64StringFromTexture(this) : GenerateBase64StringFromTextureAsync(this);
            }
        }
        serializationObject.invertY = this._invertY;
        serializationObject.samplingMode = this.samplingMode;
        serializationObject._creationFlags = this._creationFlags;
        serializationObject._useSRGBBuffer = this._useSRGBBuffer;
        this.name = savedName;
        return serializationObject;
    };
    /**
     * Get the current class name of the texture useful for serialization or dynamic coding.
     * @returns "Texture"
     */
    Texture.prototype.getClassName = function () {
        return "Texture";
    };
    /**
     * Dispose the texture and release its associated resources.
     */
    Texture.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.onLoadObservable.clear();
        this._delayedOnLoad = null;
        this._delayedOnError = null;
    };
    /**
     * Parse the JSON representation of a texture in order to recreate the texture in the given scene.
     * @param parsedTexture Define the JSON representation of the texture
     * @param scene Define the scene the parsed texture should be instantiated in
     * @param rootUrl Define the root url of the parsing sequence in the case of relative dependencies
     * @returns The parsed texture if successful
     */
    Texture.Parse = function (parsedTexture, scene, rootUrl) {
        if (parsedTexture.customType) {
            var customTexture = InstantiationTools.Instantiate(parsedTexture.customType);
            // Update Sampling Mode
            var parsedCustomTexture = customTexture.Parse(parsedTexture, scene, rootUrl);
            if (parsedTexture.samplingMode && parsedCustomTexture.updateSamplingMode && parsedCustomTexture._samplingMode) {
                if (parsedCustomTexture._samplingMode !== parsedTexture.samplingMode) {
                    parsedCustomTexture.updateSamplingMode(parsedTexture.samplingMode);
                }
            }
            return parsedCustomTexture;
        }
        if (parsedTexture.isCube && !parsedTexture.isRenderTarget) {
            return Texture._CubeTextureParser(parsedTexture, scene, rootUrl);
        }
        if (!parsedTexture.name && !parsedTexture.isRenderTarget) {
            return null;
        }
        var onLoaded = function () {
            // Clear cache
            if (texture && texture._texture) {
                texture._texture._cachedWrapU = null;
                texture._texture._cachedWrapV = null;
                texture._texture._cachedWrapR = null;
            }
            // Update Sampling Mode
            if (parsedTexture.samplingMode) {
                var sampling = parsedTexture.samplingMode;
                if (texture && texture.samplingMode !== sampling) {
                    texture.updateSamplingMode(sampling);
                }
            }
            // Animations
            if (texture && parsedTexture.animations) {
                for (var animationIndex = 0; animationIndex < parsedTexture.animations.length; animationIndex++) {
                    var parsedAnimation = parsedTexture.animations[animationIndex];
                    var internalClass = GetClass("BABYLON.Animation");
                    if (internalClass) {
                        texture.animations.push(internalClass.Parse(parsedAnimation));
                    }
                }
            }
        };
        var texture = SerializationHelper.Parse(function () {
            var _a, _b, _c;
            var generateMipMaps = true;
            if (parsedTexture.noMipmap) {
                generateMipMaps = false;
            }
            if (parsedTexture.mirrorPlane) {
                var mirrorTexture = Texture._CreateMirror(parsedTexture.name, parsedTexture.renderTargetSize, scene, generateMipMaps);
                mirrorTexture._waitingRenderList = parsedTexture.renderList;
                mirrorTexture.mirrorPlane = Plane.FromArray(parsedTexture.mirrorPlane);
                onLoaded();
                return mirrorTexture;
            }
            else if (parsedTexture.isRenderTarget) {
                var renderTargetTexture = null;
                if (parsedTexture.isCube) {
                    // Search for an existing reflection probe (which contains a cube render target texture)
                    if (scene.reflectionProbes) {
                        for (var index = 0; index < scene.reflectionProbes.length; index++) {
                            var probe = scene.reflectionProbes[index];
                            if (probe.name === parsedTexture.name) {
                                return probe.cubeTexture;
                            }
                        }
                    }
                }
                else {
                    renderTargetTexture = Texture._CreateRenderTargetTexture(parsedTexture.name, parsedTexture.renderTargetSize, scene, generateMipMaps, (_a = parsedTexture._creationFlags) !== null && _a !== void 0 ? _a : 0);
                    renderTargetTexture._waitingRenderList = parsedTexture.renderList;
                }
                onLoaded();
                return renderTargetTexture;
            }
            else {
                var texture_1;
                if (parsedTexture.base64String) {
                    texture_1 = Texture.CreateFromBase64String(parsedTexture.base64String, parsedTexture.name, scene, !generateMipMaps, parsedTexture.invertY, parsedTexture.samplingMode, onLoaded, (_b = parsedTexture._creationFlags) !== null && _b !== void 0 ? _b : 0, (_c = parsedTexture._useSRGBBuffer) !== null && _c !== void 0 ? _c : false);
                }
                else {
                    var url = void 0;
                    if (parsedTexture.name && parsedTexture.name.indexOf("://") > 0) {
                        url = parsedTexture.name;
                    }
                    else {
                        url = rootUrl + parsedTexture.name;
                    }
                    if (StartsWith(parsedTexture.url, "data:") || (Texture.UseSerializedUrlIfAny && parsedTexture.url)) {
                        url = parsedTexture.url;
                    }
                    texture_1 = new Texture(url, scene, !generateMipMaps, parsedTexture.invertY, parsedTexture.samplingMode, onLoaded);
                }
                return texture_1;
            }
        }, parsedTexture, scene);
        return texture;
    };
    /**
     * Creates a texture from its base 64 representation.
     * @param data Define the base64 payload without the data: prefix
     * @param name Define the name of the texture in the scene useful fo caching purpose for instance
     * @param scene Define the scene the texture should belong to
     * @param noMipmapOrOptions defines if the texture will require mip maps or not or set of all options to create the texture
     * @param invertY define if the texture needs to be inverted on the y axis during loading
     * @param samplingMode define the sampling mode we want for the texture while fetching from it (Texture.NEAREST_SAMPLINGMODE...)
     * @param onLoad define a callback triggered when the texture has been loaded
     * @param onError define a callback triggered when an error occurred during the loading session
     * @param format define the format of the texture we are trying to load (Engine.TEXTUREFORMAT_RGBA...)
     * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
     * @returns the created texture
     */
    Texture.CreateFromBase64String = function (data, name, scene, noMipmapOrOptions, invertY, samplingMode, onLoad, onError, format, creationFlags) {
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (format === void 0) { format = 5; }
        return new Texture("data:" + name, scene, noMipmapOrOptions, invertY, samplingMode, onLoad, onError, data, false, format, undefined, undefined, creationFlags);
    };
    /**
     * Creates a texture from its data: representation. (data: will be added in case only the payload has been passed in)
     * @param name Define the name of the texture in the scene useful fo caching purpose for instance
     * @param buffer define the buffer to load the texture from in case the texture is loaded from a buffer representation
     * @param scene Define the scene the texture should belong to
     * @param deleteBuffer define if the buffer we are loading the texture from should be deleted after load
     * @param noMipmapOrOptions defines if the texture will require mip maps or not or set of all options to create the texture
     * @param invertY define if the texture needs to be inverted on the y axis during loading
     * @param samplingMode define the sampling mode we want for the texture while fetching from it (Texture.NEAREST_SAMPLINGMODE...)
     * @param onLoad define a callback triggered when the texture has been loaded
     * @param onError define a callback triggered when an error occurred during the loading session
     * @param format define the format of the texture we are trying to load (Engine.TEXTUREFORMAT_RGBA...)
     * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
     * @returns the created texture
     */
    Texture.LoadFromDataString = function (name, buffer, scene, deleteBuffer, noMipmapOrOptions, invertY, samplingMode, onLoad, onError, format, creationFlags) {
        if (deleteBuffer === void 0) { deleteBuffer = false; }
        if (invertY === void 0) { invertY = true; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (format === void 0) { format = 5; }
        if (name.substr(0, 5) !== "data:") {
            name = "data:" + name;
        }
        return new Texture(name, scene, noMipmapOrOptions, invertY, samplingMode, onLoad, onError, buffer, deleteBuffer, format, undefined, undefined, creationFlags);
    };
    /**
     * Gets or sets a general boolean used to indicate that textures containing direct data (buffers) must be saved as part of the serialization process
     */
    Texture.SerializeBuffers = true;
    /**
     * Gets or sets a general boolean used to indicate that texture buffers must be saved as part of the serialization process.
     * If no buffer exists, one will be created as base64 string from the internal webgl data.
     */
    Texture.ForceSerializeBuffers = false;
    /**
     * This observable will notify when any texture had a loading error
     */
    Texture.OnTextureLoadErrorObservable = new Observable();
    /**
     * @param jsonTexture
     * @param scene
     * @param rootUrl
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Texture._CubeTextureParser = function (jsonTexture, scene, rootUrl) {
        throw _WarnImport("CubeTexture");
    };
    /**
     * @param name
     * @param renderTargetSize
     * @param scene
     * @param generateMipMaps
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Texture._CreateMirror = function (name, renderTargetSize, scene, generateMipMaps) {
        throw _WarnImport("MirrorTexture");
    };
    /**
     * @param name
     * @param renderTargetSize
     * @param scene
     * @param generateMipMaps
     * @param creationFlags
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Texture._CreateRenderTargetTexture = function (name, renderTargetSize, scene, generateMipMaps, creationFlags) {
        throw _WarnImport("RenderTargetTexture");
    };
    /** nearest is mag = nearest and min = nearest and mip = linear */
    Texture.NEAREST_SAMPLINGMODE = 1;
    /** nearest is mag = nearest and min = nearest and mip = linear */
    Texture.NEAREST_NEAREST_MIPLINEAR = 8; // nearest is mag = nearest and min = nearest and mip = linear
    /** Bilinear is mag = linear and min = linear and mip = nearest */
    Texture.BILINEAR_SAMPLINGMODE = 2;
    /** Bilinear is mag = linear and min = linear and mip = nearest */
    Texture.LINEAR_LINEAR_MIPNEAREST = 11; // Bilinear is mag = linear and min = linear and mip = nearest
    /** Trilinear is mag = linear and min = linear and mip = linear */
    Texture.TRILINEAR_SAMPLINGMODE = 3;
    /** Trilinear is mag = linear and min = linear and mip = linear */
    Texture.LINEAR_LINEAR_MIPLINEAR = 3; // Trilinear is mag = linear and min = linear and mip = linear
    /** mag = nearest and min = nearest and mip = nearest */
    Texture.NEAREST_NEAREST_MIPNEAREST = 4;
    /** mag = nearest and min = linear and mip = nearest */
    Texture.NEAREST_LINEAR_MIPNEAREST = 5;
    /** mag = nearest and min = linear and mip = linear */
    Texture.NEAREST_LINEAR_MIPLINEAR = 6;
    /** mag = nearest and min = linear and mip = none */
    Texture.NEAREST_LINEAR = 7;
    /** mag = nearest and min = nearest and mip = none */
    Texture.NEAREST_NEAREST = 1;
    /** mag = linear and min = nearest and mip = nearest */
    Texture.LINEAR_NEAREST_MIPNEAREST = 9;
    /** mag = linear and min = nearest and mip = linear */
    Texture.LINEAR_NEAREST_MIPLINEAR = 10;
    /** mag = linear and min = linear and mip = none */
    Texture.LINEAR_LINEAR = 2;
    /** mag = linear and min = nearest and mip = none */
    Texture.LINEAR_NEAREST = 12;
    /** Explicit coordinates mode */
    Texture.EXPLICIT_MODE = 0;
    /** Spherical coordinates mode */
    Texture.SPHERICAL_MODE = 1;
    /** Planar coordinates mode */
    Texture.PLANAR_MODE = 2;
    /** Cubic coordinates mode */
    Texture.CUBIC_MODE = 3;
    /** Projection coordinates mode */
    Texture.PROJECTION_MODE = 4;
    /** Inverse Cubic coordinates mode */
    Texture.SKYBOX_MODE = 5;
    /** Inverse Cubic coordinates mode */
    Texture.INVCUBIC_MODE = 6;
    /** Equirectangular coordinates mode */
    Texture.EQUIRECTANGULAR_MODE = 7;
    /** Equirectangular Fixed coordinates mode */
    Texture.FIXED_EQUIRECTANGULAR_MODE = 8;
    /** Equirectangular Fixed Mirrored coordinates mode */
    Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE = 9;
    /** Texture is not repeating outside of 0..1 UVs */
    Texture.CLAMP_ADDRESSMODE = 0;
    /** Texture is repeating outside of 0..1 UVs */
    Texture.WRAP_ADDRESSMODE = 1;
    /** Texture is repeating and mirrored */
    Texture.MIRROR_ADDRESSMODE = 2;
    /**
     * Gets or sets a boolean which defines if the texture url must be build from the serialized URL instead of just using the name and loading them side by side with the scene file
     */
    Texture.UseSerializedUrlIfAny = false;
    __decorate([
        serialize()
    ], Texture.prototype, "url", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "uOffset", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "vOffset", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "uScale", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "vScale", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "uAng", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "vAng", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "wAng", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "uRotationCenter", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "vRotationCenter", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "wRotationCenter", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "homogeneousRotationInUVTransform", void 0);
    __decorate([
        serialize()
    ], Texture.prototype, "isBlocking", null);
    return Texture;
}(BaseTexture));
export { Texture };
// References the dependencies.
RegisterClass("BABYLON.Texture", Texture);
SerializationHelper._TextureParser = Texture.Parse;
//# sourceMappingURL=texture.js.map