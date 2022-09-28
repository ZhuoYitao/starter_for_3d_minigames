import { __decorate, __extends } from "tslib";
/* eslint-disable @typescript-eslint/naming-convention */
import { serialize, expandToProperty, serializeAsColor3, serializeAsTexture } from "../../Misc/decorators.js";
import { Color3 } from "../../Maths/math.color.js";
import { MaterialFlags } from "../../Materials/materialFlags.js";
import { MaterialHelper } from "../../Materials/materialHelper.js";

import { MaterialPluginBase } from "../materialPluginBase.js";
import { MaterialDefines } from "../materialDefines.js";
/**
 * @hidden
 */
var MaterialSheenDefines = /** @class */ (function (_super) {
    __extends(MaterialSheenDefines, _super);
    function MaterialSheenDefines() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.SHEEN = false;
        _this.SHEEN_TEXTURE = false;
        _this.SHEEN_GAMMATEXTURE = false;
        _this.SHEEN_TEXTURE_ROUGHNESS = false;
        _this.SHEEN_TEXTUREDIRECTUV = 0;
        _this.SHEEN_TEXTURE_ROUGHNESSDIRECTUV = 0;
        _this.SHEEN_LINKWITHALBEDO = false;
        _this.SHEEN_ROUGHNESS = false;
        _this.SHEEN_ALBEDOSCALING = false;
        _this.SHEEN_USE_ROUGHNESS_FROM_MAINTEXTURE = false;
        _this.SHEEN_TEXTURE_ROUGHNESS_IDENTICAL = false;
        return _this;
    }
    return MaterialSheenDefines;
}(MaterialDefines));
export { MaterialSheenDefines };
/**
 * Plugin that implements the sheen component of the PBR material.
 */
var PBRSheenConfiguration = /** @class */ (function (_super) {
    __extends(PBRSheenConfiguration, _super);
    function PBRSheenConfiguration(material, addToPluginList) {
        if (addToPluginList === void 0) { addToPluginList = true; }
        var _this = _super.call(this, material, "Sheen", 120, new MaterialSheenDefines(), addToPluginList) || this;
        _this._isEnabled = false;
        /**
         * Defines if the material uses sheen.
         */
        _this.isEnabled = false;
        _this._linkSheenWithAlbedo = false;
        /**
         * Defines if the sheen is linked to the sheen color.
         */
        _this.linkSheenWithAlbedo = false;
        /**
         * Defines the sheen intensity.
         */
        _this.intensity = 1;
        /**
         * Defines the sheen color.
         */
        _this.color = Color3.White();
        _this._texture = null;
        /**
         * Stores the sheen tint values in a texture.
         * rgb is tint
         * a is a intensity or roughness if the roughness property has been defined and useRoughnessFromTexture is true (in that case, textureRoughness won't be used)
         * If the roughness property has been defined and useRoughnessFromTexture is false then the alpha channel is not used to modulate roughness
         */
        _this.texture = null;
        _this._useRoughnessFromMainTexture = true;
        /**
         * Indicates that the alpha channel of the texture property will be used for roughness.
         * Has no effect if the roughness (and texture!) property is not defined
         */
        _this.useRoughnessFromMainTexture = true;
        _this._roughness = null;
        /**
         * Defines the sheen roughness.
         * It is not taken into account if linkSheenWithAlbedo is true.
         * To stay backward compatible, material roughness is used instead if sheen roughness = null
         */
        _this.roughness = null;
        _this._textureRoughness = null;
        /**
         * Stores the sheen roughness in a texture.
         * alpha channel is the roughness. This texture won't be used if the texture property is not empty and useRoughnessFromTexture is true
         */
        _this.textureRoughness = null;
        _this._albedoScaling = false;
        /**
         * If true, the sheen effect is layered above the base BRDF with the albedo-scaling technique.
         * It allows the strength of the sheen effect to not depend on the base color of the material,
         * making it easier to setup and tweak the effect
         */
        _this.albedoScaling = false;
        _this._internalMarkAllSubMeshesAsTexturesDirty = material._dirtyCallbacks[1];
        return _this;
    }
    /** @hidden */
    PBRSheenConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._enable(this._isEnabled);
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    PBRSheenConfiguration.prototype.isReadyForSubMesh = function (defines, scene) {
        if (!this._isEnabled) {
            return true;
        }
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._texture && MaterialFlags.SheenTextureEnabled) {
                    if (!this._texture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._textureRoughness && MaterialFlags.SheenTextureEnabled) {
                    if (!this._textureRoughness.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    PBRSheenConfiguration.prototype.prepareDefines = function (defines, scene) {
        var _a;
        if (this._isEnabled) {
            defines.SHEEN = true;
            defines.SHEEN_LINKWITHALBEDO = this._linkSheenWithAlbedo;
            defines.SHEEN_ROUGHNESS = this._roughness !== null;
            defines.SHEEN_ALBEDOSCALING = this._albedoScaling;
            defines.SHEEN_USE_ROUGHNESS_FROM_MAINTEXTURE = this._useRoughnessFromMainTexture;
            defines.SHEEN_TEXTURE_ROUGHNESS_IDENTICAL =
                this._texture !== null && this._texture._texture === ((_a = this._textureRoughness) === null || _a === void 0 ? void 0 : _a._texture) && this._texture.checkTransformsAreIdentical(this._textureRoughness);
            if (defines._areTexturesDirty) {
                if (scene.texturesEnabled) {
                    if (this._texture && MaterialFlags.SheenTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._texture, defines, "SHEEN_TEXTURE");
                        defines.SHEEN_GAMMATEXTURE = this._texture.gammaSpace;
                    }
                    else {
                        defines.SHEEN_TEXTURE = false;
                    }
                    if (this._textureRoughness && MaterialFlags.SheenTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._textureRoughness, defines, "SHEEN_TEXTURE_ROUGHNESS");
                    }
                    else {
                        defines.SHEEN_TEXTURE_ROUGHNESS = false;
                    }
                }
            }
        }
        else {
            defines.SHEEN = false;
            defines.SHEEN_TEXTURE = false;
            defines.SHEEN_TEXTURE_ROUGHNESS = false;
            defines.SHEEN_LINKWITHALBEDO = false;
            defines.SHEEN_ROUGHNESS = false;
            defines.SHEEN_ALBEDOSCALING = false;
            defines.SHEEN_USE_ROUGHNESS_FROM_MAINTEXTURE = false;
            defines.SHEEN_TEXTURE_ROUGHNESS_IDENTICAL = false;
        }
    };
    PBRSheenConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene, engine, subMesh) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this._isEnabled) {
            return;
        }
        var defines = subMesh.materialDefines;
        var isFrozen = this._material.isFrozen;
        var identicalTextures = defines.SHEEN_TEXTURE_ROUGHNESS_IDENTICAL;
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (identicalTextures && MaterialFlags.SheenTextureEnabled) {
                uniformBuffer.updateFloat4("vSheenInfos", this._texture.coordinatesIndex, this._texture.level, -1, -1);
                MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "sheen");
            }
            else if ((this._texture || this._textureRoughness) && MaterialFlags.SheenTextureEnabled) {
                uniformBuffer.updateFloat4("vSheenInfos", (_b = (_a = this._texture) === null || _a === void 0 ? void 0 : _a.coordinatesIndex) !== null && _b !== void 0 ? _b : 0, (_d = (_c = this._texture) === null || _c === void 0 ? void 0 : _c.level) !== null && _d !== void 0 ? _d : 0, (_f = (_e = this._textureRoughness) === null || _e === void 0 ? void 0 : _e.coordinatesIndex) !== null && _f !== void 0 ? _f : 0, (_h = (_g = this._textureRoughness) === null || _g === void 0 ? void 0 : _g.level) !== null && _h !== void 0 ? _h : 0);
                if (this._texture) {
                    MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "sheen");
                }
                if (this._textureRoughness && !identicalTextures && !defines.SHEEN_USE_ROUGHNESS_FROM_MAINTEXTURE) {
                    MaterialHelper.BindTextureMatrix(this._textureRoughness, uniformBuffer, "sheenRoughness");
                }
            }
            // Sheen
            uniformBuffer.updateFloat4("vSheenColor", this.color.r, this.color.g, this.color.b, this.intensity);
            if (this._roughness !== null) {
                uniformBuffer.updateFloat("vSheenRoughness", this._roughness);
            }
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._texture && MaterialFlags.SheenTextureEnabled) {
                uniformBuffer.setTexture("sheenSampler", this._texture);
            }
            if (this._textureRoughness && !identicalTextures && !defines.SHEEN_USE_ROUGHNESS_FROM_MAINTEXTURE && MaterialFlags.SheenTextureEnabled) {
                uniformBuffer.setTexture("sheenRoughnessSampler", this._textureRoughness);
            }
        }
    };
    PBRSheenConfiguration.prototype.hasTexture = function (texture) {
        if (this._texture === texture) {
            return true;
        }
        if (this._textureRoughness === texture) {
            return true;
        }
        return false;
    };
    PBRSheenConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._texture) {
            activeTextures.push(this._texture);
        }
        if (this._textureRoughness) {
            activeTextures.push(this._textureRoughness);
        }
    };
    PBRSheenConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._texture && this._texture.animations && this._texture.animations.length > 0) {
            animatables.push(this._texture);
        }
        if (this._textureRoughness && this._textureRoughness.animations && this._textureRoughness.animations.length > 0) {
            animatables.push(this._textureRoughness);
        }
    };
    PBRSheenConfiguration.prototype.dispose = function (forceDisposeTextures) {
        var _a, _b;
        if (forceDisposeTextures) {
            (_a = this._texture) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this._textureRoughness) === null || _b === void 0 ? void 0 : _b.dispose();
        }
    };
    PBRSheenConfiguration.prototype.getClassName = function () {
        return "PBRSheenConfiguration";
    };
    PBRSheenConfiguration.prototype.addFallbacks = function (defines, fallbacks, currentRank) {
        if (defines.SHEEN) {
            fallbacks.addFallback(currentRank++, "SHEEN");
        }
        return currentRank;
    };
    PBRSheenConfiguration.prototype.getSamplers = function (samplers) {
        samplers.push("sheenSampler", "sheenRoughnessSampler");
    };
    PBRSheenConfiguration.prototype.getUniforms = function () {
        return {
            ubo: [
                { name: "vSheenColor", size: 4, type: "vec4" },
                { name: "vSheenRoughness", size: 1, type: "float" },
                { name: "vSheenInfos", size: 4, type: "vec4" },
                { name: "sheenMatrix", size: 16, type: "mat4" },
                { name: "sheenRoughnessMatrix", size: 16, type: "mat4" },
            ],
        };
    };
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "isEnabled", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "linkSheenWithAlbedo", void 0);
    __decorate([
        serialize()
    ], PBRSheenConfiguration.prototype, "intensity", void 0);
    __decorate([
        serializeAsColor3()
    ], PBRSheenConfiguration.prototype, "color", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "texture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "useRoughnessFromMainTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "roughness", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "textureRoughness", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "albedoScaling", void 0);
    return PBRSheenConfiguration;
}(MaterialPluginBase));
export { PBRSheenConfiguration };
//# sourceMappingURL=pbrSheenConfiguration.js.map