import { __decorate, __extends } from "tslib";
/* eslint-disable @typescript-eslint/naming-convention */

import { serialize, expandToProperty } from "../../Misc/decorators.js";
import { MaterialDefines } from "../materialDefines.js";
import { MaterialPluginBase } from "../materialPluginBase.js";
/**
 * @hidden
 */
var MaterialBRDFDefines = /** @class */ (function (_super) {
    __extends(MaterialBRDFDefines, _super);
    function MaterialBRDFDefines() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.BRDF_V_HEIGHT_CORRELATED = false;
        _this.MS_BRDF_ENERGY_CONSERVATION = false;
        _this.SPHERICAL_HARMONICS = false;
        _this.SPECULAR_GLOSSINESS_ENERGY_CONSERVATION = false;
        return _this;
    }
    return MaterialBRDFDefines;
}(MaterialDefines));
export { MaterialBRDFDefines };
/**
 * Plugin that implements the BRDF component of the PBR material
 */
var PBRBRDFConfiguration = /** @class */ (function (_super) {
    __extends(PBRBRDFConfiguration, _super);
    function PBRBRDFConfiguration(material, addToPluginList) {
        if (addToPluginList === void 0) { addToPluginList = true; }
        var _this = _super.call(this, material, "PBRBRDF", 90, new MaterialBRDFDefines(), addToPluginList) || this;
        _this._useEnergyConservation = PBRBRDFConfiguration.DEFAULT_USE_ENERGY_CONSERVATION;
        /**
         * Defines if the material uses energy conservation.
         */
        _this.useEnergyConservation = PBRBRDFConfiguration.DEFAULT_USE_ENERGY_CONSERVATION;
        _this._useSmithVisibilityHeightCorrelated = PBRBRDFConfiguration.DEFAULT_USE_SMITH_VISIBILITY_HEIGHT_CORRELATED;
        /**
         * LEGACY Mode set to false
         * Defines if the material uses height smith correlated visibility term.
         * If you intent to not use our default BRDF, you need to load a separate BRDF Texture for the PBR
         * You can either load https://assets.babylonjs.com/environments/uncorrelatedBRDF.png
         * or https://assets.babylonjs.com/environments/uncorrelatedBRDF.dds to have more precision
         * Not relying on height correlated will also disable energy conservation.
         */
        _this.useSmithVisibilityHeightCorrelated = PBRBRDFConfiguration.DEFAULT_USE_SMITH_VISIBILITY_HEIGHT_CORRELATED;
        _this._useSphericalHarmonics = PBRBRDFConfiguration.DEFAULT_USE_SPHERICAL_HARMONICS;
        /**
         * LEGACY Mode set to false
         * Defines if the material uses spherical harmonics vs spherical polynomials for the
         * diffuse part of the IBL.
         * The harmonics despite a tiny bigger cost has been proven to provide closer results
         * to the ground truth.
         */
        _this.useSphericalHarmonics = PBRBRDFConfiguration.DEFAULT_USE_SPHERICAL_HARMONICS;
        _this._useSpecularGlossinessInputEnergyConservation = PBRBRDFConfiguration.DEFAULT_USE_SPECULAR_GLOSSINESS_INPUT_ENERGY_CONSERVATION;
        /**
         * Defines if the material uses energy conservation, when the specular workflow is active.
         * If activated, the albedo color is multiplied with (1. - maxChannel(specular color)).
         * If deactivated, a material is only physically plausible, when (albedo color + specular color) < 1.
         * In the deactivated case, the material author has to ensure energy conservation, for a physically plausible rendering.
         */
        _this.useSpecularGlossinessInputEnergyConservation = PBRBRDFConfiguration.DEFAULT_USE_SPECULAR_GLOSSINESS_INPUT_ENERGY_CONSERVATION;
        _this._internalMarkAllSubMeshesAsMiscDirty = material._dirtyCallbacks[16];
        _this._enable(true);
        return _this;
    }
    /** @hidden */
    PBRBRDFConfiguration.prototype._markAllSubMeshesAsMiscDirty = function () {
        this._internalMarkAllSubMeshesAsMiscDirty();
    };
    PBRBRDFConfiguration.prototype.prepareDefines = function (defines) {
        defines.BRDF_V_HEIGHT_CORRELATED = this._useSmithVisibilityHeightCorrelated;
        defines.MS_BRDF_ENERGY_CONSERVATION = this._useEnergyConservation && this._useSmithVisibilityHeightCorrelated;
        defines.SPHERICAL_HARMONICS = this._useSphericalHarmonics;
        defines.SPECULAR_GLOSSINESS_ENERGY_CONSERVATION = this._useSpecularGlossinessInputEnergyConservation;
    };
    PBRBRDFConfiguration.prototype.getClassName = function () {
        return "PBRBRDFConfiguration";
    };
    /**
     * Default value used for the energy conservation.
     * This should only be changed to adapt to the type of texture in scene.environmentBRDFTexture.
     */
    PBRBRDFConfiguration.DEFAULT_USE_ENERGY_CONSERVATION = true;
    /**
     * Default value used for the Smith Visibility Height Correlated mode.
     * This should only be changed to adapt to the type of texture in scene.environmentBRDFTexture.
     */
    PBRBRDFConfiguration.DEFAULT_USE_SMITH_VISIBILITY_HEIGHT_CORRELATED = true;
    /**
     * Default value used for the IBL diffuse part.
     * This can help switching back to the polynomials mode globally which is a tiny bit
     * less GPU intensive at the drawback of a lower quality.
     */
    PBRBRDFConfiguration.DEFAULT_USE_SPHERICAL_HARMONICS = true;
    /**
     * Default value used for activating energy conservation for the specular workflow.
     * If activated, the albedo color is multiplied with (1. - maxChannel(specular color)).
     * If deactivated, a material is only physically plausible, when (albedo color + specular color) < 1.
     */
    PBRBRDFConfiguration.DEFAULT_USE_SPECULAR_GLOSSINESS_INPUT_ENERGY_CONSERVATION = true;
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRBRDFConfiguration.prototype, "useEnergyConservation", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRBRDFConfiguration.prototype, "useSmithVisibilityHeightCorrelated", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRBRDFConfiguration.prototype, "useSphericalHarmonics", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRBRDFConfiguration.prototype, "useSpecularGlossinessInputEnergyConservation", void 0);
    return PBRBRDFConfiguration;
}(MaterialPluginBase));
export { PBRBRDFConfiguration };
//# sourceMappingURL=pbrBRDFConfiguration.js.map