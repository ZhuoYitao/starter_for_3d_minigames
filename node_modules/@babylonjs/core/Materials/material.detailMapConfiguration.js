import { __decorate, __extends } from "tslib";
import { Material } from "./material.js";
import { serialize, expandToProperty, serializeAsTexture } from "../Misc/decorators.js";
import { MaterialFlags } from "./materialFlags.js";
import { MaterialHelper } from "./materialHelper.js";
import { MaterialDefines } from "./materialDefines.js";
import { MaterialPluginBase } from "./materialPluginBase.js";

/**
 * @hidden
 */
var MaterialDetailMapDefines = /** @class */ (function (_super) {
    __extends(MaterialDetailMapDefines, _super);
    function MaterialDetailMapDefines() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.DETAIL = false;
        _this.DETAILDIRECTUV = 0;
        _this.DETAIL_NORMALBLENDMETHOD = 0;
        return _this;
    }
    return MaterialDetailMapDefines;
}(MaterialDefines));
export { MaterialDetailMapDefines };
/**
 * Plugin that implements the detail map component of a material
 *
 * Inspired from:
 *   Unity: https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@9.0/manual/Mask-Map-and-Detail-Map.html and https://docs.unity3d.com/Manual/StandardShaderMaterialParameterDetail.html
 *   Unreal: https://docs.unrealengine.com/en-US/Engine/Rendering/Materials/HowTo/DetailTexturing/index.html
 *   Cryengine: https://docs.cryengine.com/display/SDKDOC2/Detail+Maps
 */
var DetailMapConfiguration = /** @class */ (function (_super) {
    __extends(DetailMapConfiguration, _super);
    function DetailMapConfiguration(material, addToPluginList) {
        if (addToPluginList === void 0) { addToPluginList = true; }
        var _this = _super.call(this, material, "DetailMap", 140, new MaterialDetailMapDefines(), addToPluginList) || this;
        _this._texture = null;
        /**
         * Defines how strongly the detail diffuse/albedo channel is blended with the regular diffuse/albedo texture
         * Bigger values mean stronger blending
         */
        _this.diffuseBlendLevel = 1;
        /**
         * Defines how strongly the detail roughness channel is blended with the regular roughness value
         * Bigger values mean stronger blending. Only used with PBR materials
         */
        _this.roughnessBlendLevel = 1;
        /**
         * Defines how strong the bump effect from the detail map is
         * Bigger values mean stronger effect
         */
        _this.bumpLevel = 1;
        _this._normalBlendMethod = Material.MATERIAL_NORMALBLENDMETHOD_WHITEOUT;
        _this._isEnabled = false;
        /**
         * Enable or disable the detail map on this material
         */
        _this.isEnabled = false;
        _this._internalMarkAllSubMeshesAsTexturesDirty = material._dirtyCallbacks[1];
        return _this;
    }
    /** @hidden */
    DetailMapConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._enable(this._isEnabled);
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    DetailMapConfiguration.prototype.isReadyForSubMesh = function (defines, scene, engine) {
        if (!this._isEnabled) {
            return true;
        }
        if (defines._areTexturesDirty && scene.texturesEnabled) {
            if (engine.getCaps().standardDerivatives && this._texture && MaterialFlags.DetailTextureEnabled) {
                // Detail texture cannot be not blocking.
                if (!this._texture.isReady()) {
                    return false;
                }
            }
        }
        return true;
    };
    DetailMapConfiguration.prototype.prepareDefines = function (defines, scene) {
        if (this._isEnabled) {
            defines.DETAIL_NORMALBLENDMETHOD = this._normalBlendMethod;
            var engine = scene.getEngine();
            if (defines._areTexturesDirty) {
                if (engine.getCaps().standardDerivatives && this._texture && MaterialFlags.DetailTextureEnabled && this._isEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._texture, defines, "DETAIL");
                    defines.DETAIL_NORMALBLENDMETHOD = this._normalBlendMethod;
                }
                else {
                    defines.DETAIL = false;
                }
            }
        }
        else {
            defines.DETAIL = false;
        }
    };
    DetailMapConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene) {
        if (!this._isEnabled) {
            return;
        }
        var isFrozen = this._material.isFrozen;
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (this._texture && MaterialFlags.DetailTextureEnabled) {
                uniformBuffer.updateFloat4("vDetailInfos", this._texture.coordinatesIndex, this.diffuseBlendLevel, this.bumpLevel, this.roughnessBlendLevel);
                MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "detail");
            }
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._texture && MaterialFlags.DetailTextureEnabled) {
                uniformBuffer.setTexture("detailSampler", this._texture);
            }
        }
    };
    DetailMapConfiguration.prototype.hasTexture = function (texture) {
        if (this._texture === texture) {
            return true;
        }
        return false;
    };
    DetailMapConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._texture) {
            activeTextures.push(this._texture);
        }
    };
    DetailMapConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._texture && this._texture.animations && this._texture.animations.length > 0) {
            animatables.push(this._texture);
        }
    };
    DetailMapConfiguration.prototype.dispose = function (forceDisposeTextures) {
        var _a;
        if (forceDisposeTextures) {
            (_a = this._texture) === null || _a === void 0 ? void 0 : _a.dispose();
        }
    };
    DetailMapConfiguration.prototype.getClassName = function () {
        return "DetailMapConfiguration";
    };
    DetailMapConfiguration.prototype.getSamplers = function (samplers) {
        samplers.push("detailSampler");
    };
    DetailMapConfiguration.prototype.getUniforms = function () {
        return {
            ubo: [
                { name: "vDetailInfos", size: 4, type: "vec4" },
                { name: "detailMatrix", size: 16, type: "mat4" },
            ],
        };
    };
    __decorate([
        serializeAsTexture("detailTexture"),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], DetailMapConfiguration.prototype, "texture", void 0);
    __decorate([
        serialize()
    ], DetailMapConfiguration.prototype, "diffuseBlendLevel", void 0);
    __decorate([
        serialize()
    ], DetailMapConfiguration.prototype, "roughnessBlendLevel", void 0);
    __decorate([
        serialize()
    ], DetailMapConfiguration.prototype, "bumpLevel", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], DetailMapConfiguration.prototype, "normalBlendMethod", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], DetailMapConfiguration.prototype, "isEnabled", void 0);
    return DetailMapConfiguration;
}(MaterialPluginBase));
export { DetailMapConfiguration };
//# sourceMappingURL=material.detailMapConfiguration.js.map