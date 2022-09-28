import { __decorate, __extends } from "tslib";
/* eslint-disable @typescript-eslint/naming-convention */
import { serialize, expandToProperty, serializeAsVector2, serializeAsTexture } from "../../Misc/decorators.js";
import { VertexBuffer } from "../../Buffers/buffer.js";
import { Vector2 } from "../../Maths/math.vector.js";
import { MaterialFlags } from "../../Materials/materialFlags.js";
import { MaterialHelper } from "../../Materials/materialHelper.js";
import { MaterialPluginBase } from "../materialPluginBase.js";

import { MaterialDefines } from "../materialDefines.js";
/**
 * @hidden
 */
var MaterialAnisotropicDefines = /** @class */ (function (_super) {
    __extends(MaterialAnisotropicDefines, _super);
    function MaterialAnisotropicDefines() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ANISOTROPIC = false;
        _this.ANISOTROPIC_TEXTURE = false;
        _this.ANISOTROPIC_TEXTUREDIRECTUV = 0;
        _this.MAINUV1 = false;
        return _this;
    }
    return MaterialAnisotropicDefines;
}(MaterialDefines));
export { MaterialAnisotropicDefines };
/**
 * Plugin that implements the anisotropic component of the PBR material
 */
var PBRAnisotropicConfiguration = /** @class */ (function (_super) {
    __extends(PBRAnisotropicConfiguration, _super);
    function PBRAnisotropicConfiguration(material, addToPluginList) {
        if (addToPluginList === void 0) { addToPluginList = true; }
        var _this = _super.call(this, material, "PBRAnisotropic", 110, new MaterialAnisotropicDefines(), addToPluginList) || this;
        _this._isEnabled = false;
        /**
         * Defines if the anisotropy is enabled in the material.
         */
        _this.isEnabled = false;
        /**
         * Defines the anisotropy strength (between 0 and 1) it defaults to 1.
         */
        _this.intensity = 1;
        /**
         * Defines if the effect is along the tangents, bitangents or in between.
         * By default, the effect is "stretching" the highlights along the tangents.
         */
        _this.direction = new Vector2(1, 0);
        _this._texture = null;
        /**
         * Stores the anisotropy values in a texture.
         * rg is direction (like normal from -1 to 1)
         * b is a intensity
         */
        _this.texture = null;
        _this._internalMarkAllSubMeshesAsTexturesDirty = material._dirtyCallbacks[1];
        return _this;
    }
    /** @hidden */
    PBRAnisotropicConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._enable(this._isEnabled);
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    PBRAnisotropicConfiguration.prototype.isReadyForSubMesh = function (defines, scene) {
        if (!this._isEnabled) {
            return true;
        }
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._texture && MaterialFlags.AnisotropicTextureEnabled) {
                    if (!this._texture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    PBRAnisotropicConfiguration.prototype.prepareDefines = function (defines, scene, mesh) {
        if (this._isEnabled) {
            defines.ANISOTROPIC = this._isEnabled;
            if (this._isEnabled && !mesh.isVerticesDataPresent(VertexBuffer.TangentKind)) {
                defines._needUVs = true;
                defines.MAINUV1 = true;
            }
            if (defines._areTexturesDirty) {
                if (scene.texturesEnabled) {
                    if (this._texture && MaterialFlags.AnisotropicTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._texture, defines, "ANISOTROPIC_TEXTURE");
                    }
                    else {
                        defines.ANISOTROPIC_TEXTURE = false;
                    }
                }
            }
        }
        else {
            defines.ANISOTROPIC = false;
            defines.ANISOTROPIC_TEXTURE = false;
        }
    };
    PBRAnisotropicConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene) {
        if (!this._isEnabled) {
            return;
        }
        var isFrozen = this._material.isFrozen;
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (this._texture && MaterialFlags.AnisotropicTextureEnabled) {
                uniformBuffer.updateFloat2("vAnisotropyInfos", this._texture.coordinatesIndex, this._texture.level);
                MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "anisotropy");
            }
            // Anisotropy
            uniformBuffer.updateFloat3("vAnisotropy", this.direction.x, this.direction.y, this.intensity);
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._texture && MaterialFlags.AnisotropicTextureEnabled) {
                uniformBuffer.setTexture("anisotropySampler", this._texture);
            }
        }
    };
    PBRAnisotropicConfiguration.prototype.hasTexture = function (texture) {
        if (this._texture === texture) {
            return true;
        }
        return false;
    };
    PBRAnisotropicConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._texture) {
            activeTextures.push(this._texture);
        }
    };
    PBRAnisotropicConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._texture && this._texture.animations && this._texture.animations.length > 0) {
            animatables.push(this._texture);
        }
    };
    PBRAnisotropicConfiguration.prototype.dispose = function (forceDisposeTextures) {
        if (forceDisposeTextures) {
            if (this._texture) {
                this._texture.dispose();
            }
        }
    };
    PBRAnisotropicConfiguration.prototype.getClassName = function () {
        return "PBRAnisotropicConfiguration";
    };
    PBRAnisotropicConfiguration.prototype.addFallbacks = function (defines, fallbacks, currentRank) {
        if (defines.ANISOTROPIC) {
            fallbacks.addFallback(currentRank++, "ANISOTROPIC");
        }
        return currentRank;
    };
    PBRAnisotropicConfiguration.prototype.getSamplers = function (samplers) {
        samplers.push("anisotropySampler");
    };
    PBRAnisotropicConfiguration.prototype.getUniforms = function () {
        return {
            ubo: [
                { name: "vAnisotropy", size: 3, type: "vec3" },
                { name: "vAnisotropyInfos", size: 2, type: "vec2" },
                { name: "anisotropyMatrix", size: 16, type: "mat4" },
            ],
        };
    };
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRAnisotropicConfiguration.prototype, "isEnabled", void 0);
    __decorate([
        serialize()
    ], PBRAnisotropicConfiguration.prototype, "intensity", void 0);
    __decorate([
        serializeAsVector2()
    ], PBRAnisotropicConfiguration.prototype, "direction", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRAnisotropicConfiguration.prototype, "texture", void 0);
    return PBRAnisotropicConfiguration;
}(MaterialPluginBase));
export { PBRAnisotropicConfiguration };
//# sourceMappingURL=pbrAnisotropicConfiguration.js.map