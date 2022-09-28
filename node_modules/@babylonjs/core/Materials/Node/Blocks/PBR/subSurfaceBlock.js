import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { InputBlock } from "../Input/inputBlock.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { RefractionBlock } from "./refractionBlock.js";
/**
 * Block used to implement the sub surface module of the PBR material
 */
var SubSurfaceBlock = /** @class */ (function (_super) {
    __extends(SubSurfaceBlock, _super);
    /**
     * Create a new SubSurfaceBlock
     * @param name defines the block name
     */
    function SubSurfaceBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this._isUnique = true;
        _this.registerInput("thickness", NodeMaterialBlockConnectionPointTypes.Float, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("tintColor", NodeMaterialBlockConnectionPointTypes.Color3, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("translucencyIntensity", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("translucencyDiffusionDist", NodeMaterialBlockConnectionPointTypes.Color3, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("refraction", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("refraction", _this, NodeMaterialConnectionPointDirection.Input, RefractionBlock, "RefractionBlock"));
        _this.registerOutput("subsurface", NodeMaterialBlockConnectionPointTypes.Object, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("subsurface", _this, NodeMaterialConnectionPointDirection.Output, SubSurfaceBlock, "SubSurfaceBlock"));
        return _this;
    }
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    SubSurfaceBlock.prototype.initialize = function (state) {
        state._excludeVariableName("subSurfaceOut");
        state._excludeVariableName("vThicknessParam");
        state._excludeVariableName("vTintColor");
        state._excludeVariableName("vSubSurfaceIntensity");
    };
    /**
     * Gets the current class name
     * @returns the class name
     */
    SubSurfaceBlock.prototype.getClassName = function () {
        return "SubSurfaceBlock";
    };
    Object.defineProperty(SubSurfaceBlock.prototype, "thickness", {
        /**
         * Gets the thickness component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubSurfaceBlock.prototype, "tintColor", {
        /**
         * Gets the tint color input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubSurfaceBlock.prototype, "translucencyIntensity", {
        /**
         * Gets the translucency intensity input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubSurfaceBlock.prototype, "translucencyDiffusionDist", {
        /**
         * Gets the translucency diffusion distance input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubSurfaceBlock.prototype, "refraction", {
        /**
         * Gets the refraction object parameters
         */
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubSurfaceBlock.prototype, "subsurface", {
        /**
         * Gets the sub surface object output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    SubSurfaceBlock.prototype.autoConfigure = function () {
        if (!this.thickness.isConnected) {
            var thicknessInput = new InputBlock("SubSurface thickness", NodeMaterialBlockTargets.Fragment, NodeMaterialBlockConnectionPointTypes.Float);
            thicknessInput.value = 0;
            thicknessInput.output.connectTo(this.thickness);
        }
    };
    SubSurfaceBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        _super.prototype.prepareDefines.call(this, mesh, nodeMaterial, defines);
        var translucencyEnabled = this.translucencyDiffusionDist.isConnected || this.translucencyIntensity.isConnected;
        defines.setValue("SUBSURFACE", translucencyEnabled || this.refraction.isConnected, true);
        defines.setValue("SS_TRANSLUCENCY", translucencyEnabled, true);
        defines.setValue("SS_THICKNESSANDMASK_TEXTURE", false, true);
        defines.setValue("SS_REFRACTIONINTENSITY_TEXTURE", false, true);
        defines.setValue("SS_TRANSLUCENCYINTENSITY_TEXTURE", false, true);
        defines.setValue("SS_MASK_FROM_THICKNESS_TEXTURE", false, true);
        defines.setValue("SS_USE_GLTF_TEXTURES", false, true);
    };
    /**
     * Gets the main code of the block (fragment side)
     * @param state current state of the node material building
     * @param ssBlock instance of a SubSurfaceBlock or null if the code must be generated without an active sub surface module
     * @param reflectionBlock instance of a ReflectionBlock null if the code must be generated without an active reflection module
     * @param worldPosVarName name of the variable holding the world position
     * @returns the shader code
     */
    SubSurfaceBlock.GetCode = function (state, ssBlock, reflectionBlock, worldPosVarName) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        var code = "";
        var thickness = (ssBlock === null || ssBlock === void 0 ? void 0 : ssBlock.thickness.isConnected) ? ssBlock.thickness.associatedVariableName : "0.";
        var tintColor = (ssBlock === null || ssBlock === void 0 ? void 0 : ssBlock.tintColor.isConnected) ? ssBlock.tintColor.associatedVariableName : "vec3(1.)";
        var translucencyIntensity = (ssBlock === null || ssBlock === void 0 ? void 0 : ssBlock.translucencyIntensity.isConnected) ? ssBlock === null || ssBlock === void 0 ? void 0 : ssBlock.translucencyIntensity.associatedVariableName : "1.";
        var translucencyDiffusionDistance = (ssBlock === null || ssBlock === void 0 ? void 0 : ssBlock.translucencyDiffusionDist.isConnected) ? ssBlock === null || ssBlock === void 0 ? void 0 : ssBlock.translucencyDiffusionDist.associatedVariableName : "vec3(1.)";
        var refractionBlock = ((ssBlock === null || ssBlock === void 0 ? void 0 : ssBlock.refraction.isConnected) ? (_a = ssBlock === null || ssBlock === void 0 ? void 0 : ssBlock.refraction.connectedPoint) === null || _a === void 0 ? void 0 : _a.ownerBlock : null);
        var refractionTintAtDistance = (refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock.tintAtDistance.isConnected) ? refractionBlock.tintAtDistance.associatedVariableName : "1.";
        var refractionIntensity = (refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock.intensity.isConnected) ? refractionBlock.intensity.associatedVariableName : "1.";
        var refractionView = (refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock.view.isConnected) ? refractionBlock.view.associatedVariableName : "";
        code += (_b = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock.getCode(state)) !== null && _b !== void 0 ? _b : "";
        code += "subSurfaceOutParams subSurfaceOut;\n\n        #ifdef SUBSURFACE\n            vec2 vThicknessParam = vec2(0., ".concat(thickness, ");\n            vec4 vTintColor = vec4(").concat(tintColor, ", ").concat(refractionTintAtDistance, ");\n            vec3 vSubSurfaceIntensity = vec3(").concat(refractionIntensity, ", ").concat(translucencyIntensity, ", 0.);\n\n            subSurfaceBlock(\n                vSubSurfaceIntensity,\n                vThicknessParam,\n                vTintColor,\n                normalW,\n                specularEnvironmentReflectance,\n            #ifdef SS_THICKNESSANDMASK_TEXTURE\n                vec4(0.),\n            #endif\n            #ifdef REFLECTION\n                #ifdef SS_TRANSLUCENCY\n                    ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._reflectionMatrixName, ",\n                    #ifdef USESPHERICALFROMREFLECTIONMAP\n                        #if !defined(NORMAL) || !defined(USESPHERICALINVERTEX)\n                            reflectionOut.irradianceVector,\n                        #endif\n                        #if defined(REALTIME_FILTERING)\n                            ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._cubeSamplerName, ",\n                            ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._vReflectionFilteringInfoName, ",\n                        #endif\n                        #endif\n                    #ifdef USEIRRADIANCEMAP\n                        irradianceSampler,\n                    #endif\n                #endif\n            #endif\n            #if defined(SS_REFRACTION) || defined(SS_TRANSLUCENCY)\n                surfaceAlbedo,\n            #endif\n            #ifdef SS_REFRACTION\n                ").concat(worldPosVarName, ".xyz,\n                viewDirectionW,\n                ").concat(refractionView, ",\n                ").concat((_c = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._vRefractionInfosName) !== null && _c !== void 0 ? _c : "", ",\n                ").concat((_d = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._refractionMatrixName) !== null && _d !== void 0 ? _d : "", ",\n                ").concat((_e = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._vRefractionMicrosurfaceInfosName) !== null && _e !== void 0 ? _e : "", ",\n                vLightingIntensity,\n                #ifdef SS_LINKREFRACTIONTOTRANSPARENCY\n                    alpha,\n                #endif\n                #ifdef ").concat((_f = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._defineLODRefractionAlpha) !== null && _f !== void 0 ? _f : "IGNORE", "\n                    NdotVUnclamped,\n                #endif\n                #ifdef ").concat((_g = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._defineLinearSpecularRefraction) !== null && _g !== void 0 ? _g : "IGNORE", "\n                    roughness,\n                #endif\n                alphaG,\n                #ifdef ").concat((_h = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._define3DName) !== null && _h !== void 0 ? _h : "IGNORE", "\n                    ").concat((_j = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._cubeSamplerName) !== null && _j !== void 0 ? _j : "", ",\n                #else\n                    ").concat((_k = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._2DSamplerName) !== null && _k !== void 0 ? _k : "", ",\n                #endif\n                #ifndef LODBASEDMICROSFURACE\n                    #ifdef ").concat((_l = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._define3DName) !== null && _l !== void 0 ? _l : "IGNORE", "\n                        ").concat((_m = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._cubeSamplerName) !== null && _m !== void 0 ? _m : "", ",\n                        ").concat((_o = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._cubeSamplerName) !== null && _o !== void 0 ? _o : "", ",\n                    #else\n                        ").concat((_p = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._2DSamplerName) !== null && _p !== void 0 ? _p : "", ",\n                        ").concat((_q = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._2DSamplerName) !== null && _q !== void 0 ? _q : "", ",\n                    #endif\n                #endif\n                #ifdef ANISOTROPIC\n                    anisotropicOut,\n                #endif\n                #ifdef REALTIME_FILTERING\n                    ").concat((_r = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._vRefractionFilteringInfoName) !== null && _r !== void 0 ? _r : "", ",\n                #endif\n                #ifdef SS_USE_LOCAL_REFRACTIONMAP_CUBIC\n                    vRefractionPosition,\n                    vRefractionSize,\n                #endif\n            #endif\n            #ifdef SS_TRANSLUCENCY\n                ").concat(translucencyDiffusionDistance, ",\n            #endif\n                subSurfaceOut\n            );\n\n            #ifdef SS_REFRACTION\n                surfaceAlbedo = subSurfaceOut.surfaceAlbedo;\n                #ifdef SS_LINKREFRACTIONTOTRANSPARENCY\n                    alpha = subSurfaceOut.alpha;\n                #endif\n            #endif\n        #else\n            subSurfaceOut.specularEnvironmentReflectance = specularEnvironmentReflectance;\n        #endif\r\n");
        return code;
    };
    SubSurfaceBlock.prototype._buildBlock = function (state) {
        if (state.target === NodeMaterialBlockTargets.Fragment) {
            state.sharedData.blocksWithDefines.push(this);
        }
        return this;
    };
    return SubSurfaceBlock;
}(NodeMaterialBlock));
export { SubSurfaceBlock };
RegisterClass("BABYLON.SubSurfaceBlock", SubSurfaceBlock);
//# sourceMappingURL=subSurfaceBlock.js.map