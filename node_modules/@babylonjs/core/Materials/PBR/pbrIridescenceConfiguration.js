import { __decorate, __extends } from "tslib";
import { serialize, serializeAsTexture, expandToProperty } from "../../Misc/decorators.js";
import { MaterialFlags } from "../materialFlags.js";
import { MaterialHelper } from "../../Materials/materialHelper.js";

import { MaterialPluginBase } from "../materialPluginBase.js";
import { MaterialDefines } from "../materialDefines.js";
/**
 * @hidden
 */
var MaterialIridescenceDefines = /** @class */ (function (_super) {
    __extends(MaterialIridescenceDefines, _super);
    function MaterialIridescenceDefines() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.IRIDESCENCE = false;
        _this.IRIDESCENCE_TEXTURE = false;
        _this.IRIDESCENCE_TEXTUREDIRECTUV = 0;
        _this.IRIDESCENCE_THICKNESS_TEXTURE = false;
        _this.IRIDESCENCE_THICKNESS_TEXTUREDIRECTUV = 0;
        _this.IRIDESCENCE_USE_THICKNESS_FROM_MAINTEXTURE = false;
        return _this;
    }
    return MaterialIridescenceDefines;
}(MaterialDefines));
export { MaterialIridescenceDefines };
/**
 * Plugin that implements the iridescence (thin film) component of the PBR material
 */
var PBRIridescenceConfiguration = /** @class */ (function (_super) {
    __extends(PBRIridescenceConfiguration, _super);
    function PBRIridescenceConfiguration(material, addToPluginList) {
        if (addToPluginList === void 0) { addToPluginList = true; }
        var _this = _super.call(this, material, "PBRIridescence", 110, new MaterialIridescenceDefines(), addToPluginList) || this;
        _this._isEnabled = false;
        /**
         * Defines if the iridescence is enabled in the material.
         */
        _this.isEnabled = false;
        /**
         * Defines the iridescence layer strength (between 0 and 1) it defaults to 1.
         */
        _this.intensity = 1;
        /**
         * Defines the minimum thickness of the thin-film layer given in nanometers (nm).
         */
        _this.minimumThickness = PBRIridescenceConfiguration._DefaultMinimumThickness;
        /**
         * Defines the maximum thickness of the thin-film layer given in nanometers (nm). This will be the thickness used if not thickness texture has been set.
         */
        _this.maximumThickness = PBRIridescenceConfiguration._DefaultMaximumThickness;
        /**
         * Defines the maximum thickness of the thin-film layer given in nanometers (nm).
         */
        _this.indexOfRefraction = PBRIridescenceConfiguration._DefaultIndexOfRefraction;
        _this._texture = null;
        /**
         * Stores the iridescence intensity in a texture (red channel)
         */
        _this.texture = null;
        _this._thicknessTexture = null;
        /**
         * Stores the iridescence thickness in a texture (green channel)
         */
        _this.thicknessTexture = null;
        _this._internalMarkAllSubMeshesAsTexturesDirty = material._dirtyCallbacks[1];
        return _this;
    }
    /** @hidden */
    PBRIridescenceConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._enable(this._isEnabled);
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    PBRIridescenceConfiguration.prototype.isReadyForSubMesh = function (defines, scene) {
        if (!this._isEnabled) {
            return true;
        }
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._texture && MaterialFlags.IridescenceTextureEnabled) {
                    if (!this._texture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._thicknessTexture && MaterialFlags.IridescenceTextureEnabled) {
                    if (!this._thicknessTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    PBRIridescenceConfiguration.prototype.prepareDefines = function (defines, scene) {
        var _a;
        if (this._isEnabled) {
            defines.IRIDESCENCE = true;
            defines.IRIDESCENCE_USE_THICKNESS_FROM_MAINTEXTURE =
                this._texture !== null && this._texture._texture === ((_a = this._thicknessTexture) === null || _a === void 0 ? void 0 : _a._texture) && this._texture.checkTransformsAreIdentical(this._thicknessTexture);
            if (defines._areTexturesDirty) {
                if (scene.texturesEnabled) {
                    if (this._texture && MaterialFlags.IridescenceTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._texture, defines, "IRIDESCENCE_TEXTURE");
                    }
                    else {
                        defines.IRIDESCENCE_TEXTURE = false;
                    }
                    if (!defines.IRIDESCENCE_USE_THICKNESS_FROM_MAINTEXTURE && this._thicknessTexture && MaterialFlags.IridescenceTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._thicknessTexture, defines, "IRIDESCENCE_THICKNESS_TEXTURE");
                    }
                    else {
                        defines.IRIDESCENCE_THICKNESS_TEXTURE = false;
                    }
                }
            }
        }
        else {
            defines.IRIDESCENCE = false;
            defines.IRIDESCENCE_TEXTURE = false;
            defines.IRIDESCENCE_THICKNESS_TEXTURE = false;
            defines.IRIDESCENCE_USE_THICKNESS_FROM_MAINTEXTURE = false;
        }
    };
    PBRIridescenceConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene, engine, subMesh) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this._isEnabled) {
            return;
        }
        var defines = subMesh.materialDefines;
        var isFrozen = this._material.isFrozen;
        var identicalTextures = defines.IRIDESCENCE_USE_THICKNESS_FROM_MAINTEXTURE;
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (identicalTextures && MaterialFlags.IridescenceTextureEnabled) {
                uniformBuffer.updateFloat4("vIridescenceInfos", this._texture.coordinatesIndex, this._texture.level, -1, -1);
                MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "iridescence");
            }
            else if ((this._texture || this._thicknessTexture) && MaterialFlags.IridescenceTextureEnabled) {
                uniformBuffer.updateFloat4("vIridescenceInfos", (_b = (_a = this._texture) === null || _a === void 0 ? void 0 : _a.coordinatesIndex) !== null && _b !== void 0 ? _b : 0, (_d = (_c = this._texture) === null || _c === void 0 ? void 0 : _c.level) !== null && _d !== void 0 ? _d : 0, (_f = (_e = this._thicknessTexture) === null || _e === void 0 ? void 0 : _e.coordinatesIndex) !== null && _f !== void 0 ? _f : 0, (_h = (_g = this._thicknessTexture) === null || _g === void 0 ? void 0 : _g.level) !== null && _h !== void 0 ? _h : 0);
                if (this._texture) {
                    MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "iridescence");
                }
                if (this._thicknessTexture && !identicalTextures && !defines.IRIDESCENCE_USE_THICKNESS_FROM_MAINTEXTURE) {
                    MaterialHelper.BindTextureMatrix(this._thicknessTexture, uniformBuffer, "iridescenceThickness");
                }
            }
            // Clear Coat General params
            uniformBuffer.updateFloat4("vIridescenceParams", this.intensity, this.indexOfRefraction, this.minimumThickness, this.maximumThickness);
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._texture && MaterialFlags.IridescenceTextureEnabled) {
                uniformBuffer.setTexture("iridescenceSampler", this._texture);
            }
            if (this._thicknessTexture && !identicalTextures && !defines.IRIDESCENCE_USE_THICKNESS_FROM_MAINTEXTURE && MaterialFlags.IridescenceTextureEnabled) {
                uniformBuffer.setTexture("iridescenceThicknessSampler", this._thicknessTexture);
            }
        }
    };
    PBRIridescenceConfiguration.prototype.hasTexture = function (texture) {
        if (this._texture === texture) {
            return true;
        }
        if (this._thicknessTexture === texture) {
            return true;
        }
        return false;
    };
    PBRIridescenceConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._texture) {
            activeTextures.push(this._texture);
        }
        if (this._thicknessTexture) {
            activeTextures.push(this._thicknessTexture);
        }
    };
    PBRIridescenceConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._texture && this._texture.animations && this._texture.animations.length > 0) {
            animatables.push(this._texture);
        }
        if (this._thicknessTexture && this._thicknessTexture.animations && this._thicknessTexture.animations.length > 0) {
            animatables.push(this._thicknessTexture);
        }
    };
    PBRIridescenceConfiguration.prototype.dispose = function (forceDisposeTextures) {
        var _a, _b;
        if (forceDisposeTextures) {
            (_a = this._texture) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this._thicknessTexture) === null || _b === void 0 ? void 0 : _b.dispose();
        }
    };
    PBRIridescenceConfiguration.prototype.getClassName = function () {
        return "PBRIridescenceConfiguration";
    };
    PBRIridescenceConfiguration.prototype.addFallbacks = function (defines, fallbacks, currentRank) {
        if (defines.IRIDESCENCE) {
            fallbacks.addFallback(currentRank++, "IRIDESCENCE");
        }
        return currentRank;
    };
    PBRIridescenceConfiguration.prototype.getSamplers = function (samplers) {
        samplers.push("iridescenceSampler", "iridescenceThicknessSampler");
    };
    PBRIridescenceConfiguration.prototype.getUniforms = function () {
        return {
            ubo: [
                { name: "vIridescenceParams", size: 4, type: "vec4" },
                { name: "vIridescenceInfos", size: 4, type: "vec4" },
                { name: "iridescenceMatrix", size: 16, type: "mat4" },
                { name: "iridescenceThicknessMatrix", size: 16, type: "mat4" },
            ],
        };
    };
    /**
     * The default minimum thickness of the thin-film layer given in nanometers (nm).
     * Defaults to 100 nm.
     * @hidden
     */
    PBRIridescenceConfiguration._DefaultMinimumThickness = 100;
    /**
     * The default maximum thickness of the thin-film layer given in nanometers (nm).
     * Defaults to 400 nm.
     * @hidden
     */
    PBRIridescenceConfiguration._DefaultMaximumThickness = 400;
    /**
     * The default index of refraction of the thin-film layer.
     * Defaults to 1.3
     * @hidden
     */
    PBRIridescenceConfiguration._DefaultIndexOfRefraction = 1.3;
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRIridescenceConfiguration.prototype, "isEnabled", void 0);
    __decorate([
        serialize()
    ], PBRIridescenceConfiguration.prototype, "intensity", void 0);
    __decorate([
        serialize()
    ], PBRIridescenceConfiguration.prototype, "minimumThickness", void 0);
    __decorate([
        serialize()
    ], PBRIridescenceConfiguration.prototype, "maximumThickness", void 0);
    __decorate([
        serialize()
    ], PBRIridescenceConfiguration.prototype, "indexOfRefraction", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRIridescenceConfiguration.prototype, "texture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRIridescenceConfiguration.prototype, "thicknessTexture", void 0);
    return PBRIridescenceConfiguration;
}(MaterialPluginBase));
export { PBRIridescenceConfiguration };
//# sourceMappingURL=pbrIridescenceConfiguration.js.map