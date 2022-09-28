import { __decorate, __extends } from "tslib";
import { serialize, serializeAsTexture, expandToProperty, serializeAsColor3 } from "../../Misc/decorators.js";
import { Color3 } from "../../Maths/math.color.js";
import { MaterialFlags } from "../materialFlags.js";
import { MaterialHelper } from "../../Materials/materialHelper.js";

import { MaterialPluginBase } from "../materialPluginBase.js";
import { MaterialDefines } from "../materialDefines.js";
/**
 * @hidden
 */
var MaterialClearCoatDefines = /** @class */ (function (_super) {
    __extends(MaterialClearCoatDefines, _super);
    function MaterialClearCoatDefines() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.CLEARCOAT = false;
        _this.CLEARCOAT_DEFAULTIOR = false;
        _this.CLEARCOAT_TEXTURE = false;
        _this.CLEARCOAT_TEXTURE_ROUGHNESS = false;
        _this.CLEARCOAT_TEXTUREDIRECTUV = 0;
        _this.CLEARCOAT_TEXTURE_ROUGHNESSDIRECTUV = 0;
        _this.CLEARCOAT_BUMP = false;
        _this.CLEARCOAT_BUMPDIRECTUV = 0;
        _this.CLEARCOAT_USE_ROUGHNESS_FROM_MAINTEXTURE = false;
        _this.CLEARCOAT_TEXTURE_ROUGHNESS_IDENTICAL = false;
        _this.CLEARCOAT_REMAP_F0 = false;
        _this.CLEARCOAT_TINT = false;
        _this.CLEARCOAT_TINT_TEXTURE = false;
        _this.CLEARCOAT_TINT_TEXTUREDIRECTUV = 0;
        _this.CLEARCOAT_TINT_GAMMATEXTURE = false;
        return _this;
    }
    return MaterialClearCoatDefines;
}(MaterialDefines));
export { MaterialClearCoatDefines };
/**
 * Plugin that implements the clear coat component of the PBR material
 */
var PBRClearCoatConfiguration = /** @class */ (function (_super) {
    __extends(PBRClearCoatConfiguration, _super);
    function PBRClearCoatConfiguration(material, addToPluginList) {
        if (addToPluginList === void 0) { addToPluginList = true; }
        var _this = _super.call(this, material, "PBRClearCoat", 100, new MaterialClearCoatDefines(), addToPluginList) || this;
        _this._isEnabled = false;
        /**
         * Defines if the clear coat is enabled in the material.
         */
        _this.isEnabled = false;
        /**
         * Defines the clear coat layer strength (between 0 and 1) it defaults to 1.
         */
        _this.intensity = 1;
        /**
         * Defines the clear coat layer roughness.
         */
        _this.roughness = 0;
        _this._indexOfRefraction = PBRClearCoatConfiguration._DefaultIndexOfRefraction;
        /**
         * Defines the index of refraction of the clear coat.
         * This defaults to 1.5 corresponding to a 0.04 f0 or a 4% reflectance at normal incidence
         * The default fits with a polyurethane material.
         * Changing the default value is more performance intensive.
         */
        _this.indexOfRefraction = PBRClearCoatConfiguration._DefaultIndexOfRefraction;
        _this._texture = null;
        /**
         * Stores the clear coat values in a texture (red channel is intensity and green channel is roughness)
         * If useRoughnessFromMainTexture is false, the green channel of texture is not used and the green channel of textureRoughness is used instead
         * if textureRoughness is not empty, else no texture roughness is used
         */
        _this.texture = null;
        _this._useRoughnessFromMainTexture = true;
        /**
         * Indicates that the green channel of the texture property will be used for roughness (default: true)
         * If false, the green channel from textureRoughness is used for roughness
         */
        _this.useRoughnessFromMainTexture = true;
        _this._textureRoughness = null;
        /**
         * Stores the clear coat roughness in a texture (green channel)
         * Not used if useRoughnessFromMainTexture is true
         */
        _this.textureRoughness = null;
        _this._remapF0OnInterfaceChange = true;
        /**
         * Defines if the F0 value should be remapped to account for the interface change in the material.
         */
        _this.remapF0OnInterfaceChange = true;
        _this._bumpTexture = null;
        /**
         * Define the clear coat specific bump texture.
         */
        _this.bumpTexture = null;
        _this._isTintEnabled = false;
        /**
         * Defines if the clear coat tint is enabled in the material.
         */
        _this.isTintEnabled = false;
        /**
         * Defines the clear coat tint of the material.
         * This is only use if tint is enabled
         */
        _this.tintColor = Color3.White();
        /**
         * Defines the distance at which the tint color should be found in the
         * clear coat media.
         * This is only use if tint is enabled
         */
        _this.tintColorAtDistance = 1;
        /**
         * Defines the clear coat layer thickness.
         * This is only use if tint is enabled
         */
        _this.tintThickness = 1;
        _this._tintTexture = null;
        /**
         * Stores the clear tint values in a texture.
         * rgb is tint
         * a is a thickness factor
         */
        _this.tintTexture = null;
        _this._internalMarkAllSubMeshesAsTexturesDirty = material._dirtyCallbacks[1];
        return _this;
    }
    /** @hidden */
    PBRClearCoatConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._enable(this._isEnabled);
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    PBRClearCoatConfiguration.prototype.isReadyForSubMesh = function (defines, scene, engine) {
        if (!this._isEnabled) {
            return true;
        }
        var disableBumpMap = this._material._disableBumpMap;
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._texture && MaterialFlags.ClearCoatTextureEnabled) {
                    if (!this._texture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._textureRoughness && MaterialFlags.ClearCoatTextureEnabled) {
                    if (!this._textureRoughness.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (engine.getCaps().standardDerivatives && this._bumpTexture && MaterialFlags.ClearCoatBumpTextureEnabled && !disableBumpMap) {
                    // Bump texture cannot be not blocking.
                    if (!this._bumpTexture.isReady()) {
                        return false;
                    }
                }
                if (this._isTintEnabled && this._tintTexture && MaterialFlags.ClearCoatTintTextureEnabled) {
                    if (!this._tintTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    PBRClearCoatConfiguration.prototype.prepareDefines = function (defines, scene) {
        var _a;
        if (this._isEnabled) {
            defines.CLEARCOAT = true;
            defines.CLEARCOAT_USE_ROUGHNESS_FROM_MAINTEXTURE = this._useRoughnessFromMainTexture;
            defines.CLEARCOAT_TEXTURE_ROUGHNESS_IDENTICAL =
                this._texture !== null && this._texture._texture === ((_a = this._textureRoughness) === null || _a === void 0 ? void 0 : _a._texture) && this._texture.checkTransformsAreIdentical(this._textureRoughness);
            defines.CLEARCOAT_REMAP_F0 = this._remapF0OnInterfaceChange;
            if (defines._areTexturesDirty) {
                if (scene.texturesEnabled) {
                    if (this._texture && MaterialFlags.ClearCoatTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._texture, defines, "CLEARCOAT_TEXTURE");
                    }
                    else {
                        defines.CLEARCOAT_TEXTURE = false;
                    }
                    if (this._textureRoughness && MaterialFlags.ClearCoatTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._textureRoughness, defines, "CLEARCOAT_TEXTURE_ROUGHNESS");
                    }
                    else {
                        defines.CLEARCOAT_TEXTURE_ROUGHNESS = false;
                    }
                    if (this._bumpTexture && MaterialFlags.ClearCoatBumpTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._bumpTexture, defines, "CLEARCOAT_BUMP");
                    }
                    else {
                        defines.CLEARCOAT_BUMP = false;
                    }
                    defines.CLEARCOAT_DEFAULTIOR = this._indexOfRefraction === PBRClearCoatConfiguration._DefaultIndexOfRefraction;
                    if (this._isTintEnabled) {
                        defines.CLEARCOAT_TINT = true;
                        if (this._tintTexture && MaterialFlags.ClearCoatTintTextureEnabled) {
                            MaterialHelper.PrepareDefinesForMergedUV(this._tintTexture, defines, "CLEARCOAT_TINT_TEXTURE");
                            defines.CLEARCOAT_TINT_GAMMATEXTURE = this._tintTexture.gammaSpace;
                        }
                        else {
                            defines.CLEARCOAT_TINT_TEXTURE = false;
                        }
                    }
                    else {
                        defines.CLEARCOAT_TINT = false;
                        defines.CLEARCOAT_TINT_TEXTURE = false;
                    }
                }
            }
        }
        else {
            defines.CLEARCOAT = false;
            defines.CLEARCOAT_TEXTURE = false;
            defines.CLEARCOAT_TEXTURE_ROUGHNESS = false;
            defines.CLEARCOAT_BUMP = false;
            defines.CLEARCOAT_TINT = false;
            defines.CLEARCOAT_TINT_TEXTURE = false;
            defines.CLEARCOAT_USE_ROUGHNESS_FROM_MAINTEXTURE = false;
            defines.CLEARCOAT_TEXTURE_ROUGHNESS_IDENTICAL = false;
        }
    };
    PBRClearCoatConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene, engine, subMesh) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this._isEnabled) {
            return;
        }
        var defines = subMesh.materialDefines;
        var isFrozen = this._material.isFrozen;
        var disableBumpMap = this._material._disableBumpMap;
        var invertNormalMapX = this._material._invertNormalMapX;
        var invertNormalMapY = this._material._invertNormalMapY;
        var identicalTextures = defines.CLEARCOAT_TEXTURE_ROUGHNESS_IDENTICAL;
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (identicalTextures && MaterialFlags.ClearCoatTextureEnabled) {
                uniformBuffer.updateFloat4("vClearCoatInfos", this._texture.coordinatesIndex, this._texture.level, -1, -1);
                MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "clearCoat");
            }
            else if ((this._texture || this._textureRoughness) && MaterialFlags.ClearCoatTextureEnabled) {
                uniformBuffer.updateFloat4("vClearCoatInfos", (_b = (_a = this._texture) === null || _a === void 0 ? void 0 : _a.coordinatesIndex) !== null && _b !== void 0 ? _b : 0, (_d = (_c = this._texture) === null || _c === void 0 ? void 0 : _c.level) !== null && _d !== void 0 ? _d : 0, (_f = (_e = this._textureRoughness) === null || _e === void 0 ? void 0 : _e.coordinatesIndex) !== null && _f !== void 0 ? _f : 0, (_h = (_g = this._textureRoughness) === null || _g === void 0 ? void 0 : _g.level) !== null && _h !== void 0 ? _h : 0);
                if (this._texture) {
                    MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "clearCoat");
                }
                if (this._textureRoughness && !identicalTextures && !defines.CLEARCOAT_USE_ROUGHNESS_FROM_MAINTEXTURE) {
                    MaterialHelper.BindTextureMatrix(this._textureRoughness, uniformBuffer, "clearCoatRoughness");
                }
            }
            if (this._bumpTexture && engine.getCaps().standardDerivatives && MaterialFlags.ClearCoatTextureEnabled && !disableBumpMap) {
                uniformBuffer.updateFloat2("vClearCoatBumpInfos", this._bumpTexture.coordinatesIndex, this._bumpTexture.level);
                MaterialHelper.BindTextureMatrix(this._bumpTexture, uniformBuffer, "clearCoatBump");
                if (scene._mirroredCameraPosition) {
                    uniformBuffer.updateFloat2("vClearCoatTangentSpaceParams", invertNormalMapX ? 1.0 : -1.0, invertNormalMapY ? 1.0 : -1.0);
                }
                else {
                    uniformBuffer.updateFloat2("vClearCoatTangentSpaceParams", invertNormalMapX ? -1.0 : 1.0, invertNormalMapY ? -1.0 : 1.0);
                }
            }
            if (this._tintTexture && MaterialFlags.ClearCoatTintTextureEnabled) {
                uniformBuffer.updateFloat2("vClearCoatTintInfos", this._tintTexture.coordinatesIndex, this._tintTexture.level);
                MaterialHelper.BindTextureMatrix(this._tintTexture, uniformBuffer, "clearCoatTint");
            }
            // Clear Coat General params
            uniformBuffer.updateFloat2("vClearCoatParams", this.intensity, this.roughness);
            // Clear Coat Refraction params
            var a = 1 - this._indexOfRefraction;
            var b = 1 + this._indexOfRefraction;
            var f0 = Math.pow(-a / b, 2); // Schlicks approx: (ior1 - ior2) / (ior1 + ior2) where ior2 for air is close to vacuum = 1.
            var eta = 1 / this._indexOfRefraction;
            uniformBuffer.updateFloat4("vClearCoatRefractionParams", f0, eta, a, b);
            if (this._isTintEnabled) {
                uniformBuffer.updateFloat4("vClearCoatTintParams", this.tintColor.r, this.tintColor.g, this.tintColor.b, Math.max(0.00001, this.tintThickness));
                uniformBuffer.updateFloat("clearCoatColorAtDistance", Math.max(0.00001, this.tintColorAtDistance));
            }
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._texture && MaterialFlags.ClearCoatTextureEnabled) {
                uniformBuffer.setTexture("clearCoatSampler", this._texture);
            }
            if (this._textureRoughness && !identicalTextures && !defines.CLEARCOAT_USE_ROUGHNESS_FROM_MAINTEXTURE && MaterialFlags.ClearCoatTextureEnabled) {
                uniformBuffer.setTexture("clearCoatRoughnessSampler", this._textureRoughness);
            }
            if (this._bumpTexture && engine.getCaps().standardDerivatives && MaterialFlags.ClearCoatBumpTextureEnabled && !disableBumpMap) {
                uniformBuffer.setTexture("clearCoatBumpSampler", this._bumpTexture);
            }
            if (this._isTintEnabled && this._tintTexture && MaterialFlags.ClearCoatTintTextureEnabled) {
                uniformBuffer.setTexture("clearCoatTintSampler", this._tintTexture);
            }
        }
    };
    PBRClearCoatConfiguration.prototype.hasTexture = function (texture) {
        if (this._texture === texture) {
            return true;
        }
        if (this._textureRoughness === texture) {
            return true;
        }
        if (this._bumpTexture === texture) {
            return true;
        }
        if (this._tintTexture === texture) {
            return true;
        }
        return false;
    };
    PBRClearCoatConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._texture) {
            activeTextures.push(this._texture);
        }
        if (this._textureRoughness) {
            activeTextures.push(this._textureRoughness);
        }
        if (this._bumpTexture) {
            activeTextures.push(this._bumpTexture);
        }
        if (this._tintTexture) {
            activeTextures.push(this._tintTexture);
        }
    };
    PBRClearCoatConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._texture && this._texture.animations && this._texture.animations.length > 0) {
            animatables.push(this._texture);
        }
        if (this._textureRoughness && this._textureRoughness.animations && this._textureRoughness.animations.length > 0) {
            animatables.push(this._textureRoughness);
        }
        if (this._bumpTexture && this._bumpTexture.animations && this._bumpTexture.animations.length > 0) {
            animatables.push(this._bumpTexture);
        }
        if (this._tintTexture && this._tintTexture.animations && this._tintTexture.animations.length > 0) {
            animatables.push(this._tintTexture);
        }
    };
    PBRClearCoatConfiguration.prototype.dispose = function (forceDisposeTextures) {
        var _a, _b, _c, _d;
        if (forceDisposeTextures) {
            (_a = this._texture) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this._textureRoughness) === null || _b === void 0 ? void 0 : _b.dispose();
            (_c = this._bumpTexture) === null || _c === void 0 ? void 0 : _c.dispose();
            (_d = this._tintTexture) === null || _d === void 0 ? void 0 : _d.dispose();
        }
    };
    PBRClearCoatConfiguration.prototype.getClassName = function () {
        return "PBRClearCoatConfiguration";
    };
    PBRClearCoatConfiguration.prototype.addFallbacks = function (defines, fallbacks, currentRank) {
        if (defines.CLEARCOAT_BUMP) {
            fallbacks.addFallback(currentRank++, "CLEARCOAT_BUMP");
        }
        if (defines.CLEARCOAT_TINT) {
            fallbacks.addFallback(currentRank++, "CLEARCOAT_TINT");
        }
        if (defines.CLEARCOAT) {
            fallbacks.addFallback(currentRank++, "CLEARCOAT");
        }
        return currentRank;
    };
    PBRClearCoatConfiguration.prototype.getSamplers = function (samplers) {
        samplers.push("clearCoatSampler", "clearCoatRoughnessSampler", "clearCoatBumpSampler", "clearCoatTintSampler");
    };
    PBRClearCoatConfiguration.prototype.getUniforms = function () {
        return {
            ubo: [
                { name: "vClearCoatParams", size: 2, type: "vec2" },
                { name: "vClearCoatRefractionParams", size: 4, type: "vec4" },
                { name: "vClearCoatInfos", size: 4, type: "vec4" },
                { name: "clearCoatMatrix", size: 16, type: "mat4" },
                { name: "clearCoatRoughnessMatrix", size: 16, type: "mat4" },
                { name: "vClearCoatBumpInfos", size: 2, type: "vec2" },
                { name: "vClearCoatTangentSpaceParams", size: 2, type: "vec2" },
                { name: "clearCoatBumpMatrix", size: 16, type: "mat4" },
                { name: "vClearCoatTintParams", size: 4, type: "vec4" },
                { name: "clearCoatColorAtDistance", size: 1, type: "float" },
                { name: "vClearCoatTintInfos", size: 2, type: "vec2" },
                { name: "clearCoatTintMatrix", size: 16, type: "mat4" },
            ],
        };
    };
    /**
     * This defaults to 1.5 corresponding to a 0.04 f0 or a 4% reflectance at normal incidence
     * The default fits with a polyurethane material.
     * @hidden
     */
    PBRClearCoatConfiguration._DefaultIndexOfRefraction = 1.5;
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "isEnabled", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "intensity", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "roughness", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "indexOfRefraction", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "texture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "useRoughnessFromMainTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "textureRoughness", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "remapF0OnInterfaceChange", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "bumpTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "isTintEnabled", void 0);
    __decorate([
        serializeAsColor3()
    ], PBRClearCoatConfiguration.prototype, "tintColor", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "tintColorAtDistance", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "tintThickness", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "tintTexture", void 0);
    return PBRClearCoatConfiguration;
}(MaterialPluginBase));
export { PBRClearCoatConfiguration };
//# sourceMappingURL=pbrClearCoatConfiguration.js.map