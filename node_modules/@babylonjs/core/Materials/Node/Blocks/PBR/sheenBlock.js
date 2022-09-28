import { __decorate, __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../../nodeMaterialDecorator.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
/**
 * Block used to implement the sheen module of the PBR material
 */
var SheenBlock = /** @class */ (function (_super) {
    __extends(SheenBlock, _super);
    /**
     * Create a new SheenBlock
     * @param name defines the block name
     */
    function SheenBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        /**
         * If true, the sheen effect is layered above the base BRDF with the albedo-scaling technique.
         * It allows the strength of the sheen effect to not depend on the base color of the material,
         * making it easier to setup and tweak the effect
         */
        _this.albedoScaling = false;
        /**
         * Defines if the sheen is linked to the sheen color.
         */
        _this.linkSheenWithAlbedo = false;
        _this._isUnique = true;
        _this.registerInput("intensity", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("color", NodeMaterialBlockConnectionPointTypes.Color3, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("roughness", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("sheen", NodeMaterialBlockConnectionPointTypes.Object, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("sheen", _this, NodeMaterialConnectionPointDirection.Output, SheenBlock, "SheenBlock"));
        return _this;
    }
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    SheenBlock.prototype.initialize = function (state) {
        state._excludeVariableName("sheenOut");
        state._excludeVariableName("sheenMapData");
        state._excludeVariableName("vSheenColor");
        state._excludeVariableName("vSheenRoughness");
    };
    /**
     * Gets the current class name
     * @returns the class name
     */
    SheenBlock.prototype.getClassName = function () {
        return "SheenBlock";
    };
    Object.defineProperty(SheenBlock.prototype, "intensity", {
        /**
         * Gets the intensity input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SheenBlock.prototype, "color", {
        /**
         * Gets the color input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SheenBlock.prototype, "roughness", {
        /**
         * Gets the roughness input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SheenBlock.prototype, "sheen", {
        /**
         * Gets the sheen object output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    SheenBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        _super.prototype.prepareDefines.call(this, mesh, nodeMaterial, defines);
        defines.setValue("SHEEN", true);
        defines.setValue("SHEEN_USE_ROUGHNESS_FROM_MAINTEXTURE", true, true);
        defines.setValue("SHEEN_LINKWITHALBEDO", this.linkSheenWithAlbedo, true);
        defines.setValue("SHEEN_ROUGHNESS", this.roughness.isConnected, true);
        defines.setValue("SHEEN_ALBEDOSCALING", this.albedoScaling, true);
    };
    /**
     * Gets the main code of the block (fragment side)
     * @param reflectionBlock instance of a ReflectionBlock null if the code must be generated without an active reflection module
     * @returns the shader code
     */
    SheenBlock.prototype.getCode = function (reflectionBlock) {
        var code = "";
        var color = this.color.isConnected ? this.color.associatedVariableName : "vec3(1.)";
        var intensity = this.intensity.isConnected ? this.intensity.associatedVariableName : "1.";
        var roughness = this.roughness.isConnected ? this.roughness.associatedVariableName : "0.";
        var texture = "vec4(0.)";
        code = "#ifdef SHEEN\n            sheenOutParams sheenOut;\n\n            vec4 vSheenColor = vec4(".concat(color, ", ").concat(intensity, ");\n\n            sheenBlock(\n                vSheenColor,\n            #ifdef SHEEN_ROUGHNESS\n                ").concat(roughness, ",\n            #endif\n                roughness,\n            #ifdef SHEEN_TEXTURE\n                ").concat(texture, ",\n                1.0,\n            #endif\n                reflectance,\n            #ifdef SHEEN_LINKWITHALBEDO\n                baseColor,\n                surfaceAlbedo,\n            #endif\n            #ifdef ENVIRONMENTBRDF\n                NdotV,\n                environmentBrdf,\n            #endif\n            #if defined(REFLECTION) && defined(ENVIRONMENTBRDF)\n                AARoughnessFactors,\n                ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._vReflectionMicrosurfaceInfosName, ",\n                ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._vReflectionInfosName, ",\n                ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock.reflectionColor, ",\n                vLightingIntensity,\n                #ifdef ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName, "\n                    ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._cubeSamplerName, ",\n                #else\n                    ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._2DSamplerName, ",\n                #endif\n                reflectionOut.reflectionCoords,\n                NdotVUnclamped,\n                #ifndef LODBASEDMICROSFURACE\n                    #ifdef ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName, "\n                        ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._cubeSamplerName, ",\n                        ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._cubeSamplerName, ",\n                    #else\n                        ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._2DSamplerName, ",\n                        ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._2DSamplerName, ",\n                    #endif\n                #endif\n                #if !defined(").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineSkyboxName, ") && defined(RADIANCEOCCLUSION)\n                    seo,\n                #endif\n                #if !defined(").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineSkyboxName, ") && defined(HORIZONOCCLUSION) && defined(BUMP) && defined(").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName, ")\n                    eho,\n                #endif\n            #endif\n                sheenOut\n            );\n\n            #ifdef SHEEN_LINKWITHALBEDO\n                surfaceAlbedo = sheenOut.surfaceAlbedo;\n            #endif\n        #endif\r\n");
        return code;
    };
    SheenBlock.prototype._buildBlock = function (state) {
        if (state.target === NodeMaterialBlockTargets.Fragment) {
            state.sharedData.blocksWithDefines.push(this);
        }
        return this;
    };
    SheenBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".albedoScaling = ").concat(this.albedoScaling, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".linkSheenWithAlbedo = ").concat(this.linkSheenWithAlbedo, ";\r\n");
        return codeString;
    };
    SheenBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.albedoScaling = this.albedoScaling;
        serializationObject.linkSheenWithAlbedo = this.linkSheenWithAlbedo;
        return serializationObject;
    };
    SheenBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.albedoScaling = serializationObject.albedoScaling;
        this.linkSheenWithAlbedo = serializationObject.linkSheenWithAlbedo;
    };
    __decorate([
        editableInPropertyPage("Albedo scaling", PropertyTypeForEdition.Boolean, "PROPERTIES", { notifiers: { update: true } })
    ], SheenBlock.prototype, "albedoScaling", void 0);
    __decorate([
        editableInPropertyPage("Link sheen with albedo", PropertyTypeForEdition.Boolean, "PROPERTIES", { notifiers: { update: true } })
    ], SheenBlock.prototype, "linkSheenWithAlbedo", void 0);
    return SheenBlock;
}(NodeMaterialBlock));
export { SheenBlock };
RegisterClass("BABYLON.SheenBlock", SheenBlock);
//# sourceMappingURL=sheenBlock.js.map