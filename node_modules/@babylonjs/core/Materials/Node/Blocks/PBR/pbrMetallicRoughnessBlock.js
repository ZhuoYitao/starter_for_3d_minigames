import { __decorate, __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { MaterialHelper } from "../../../materialHelper.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { NodeMaterialSystemValues } from "../../Enums/nodeMaterialSystemValues.js";
import { InputBlock } from "../Input/inputBlock.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { PBRBaseMaterial } from "../../../PBR/pbrBaseMaterial.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../../nodeMaterialDecorator.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { SheenBlock } from "./sheenBlock.js";
import { GetEnvironmentBRDFTexture } from "../../../../Misc/brdfTextureTools.js";
import { MaterialFlags } from "../../../materialFlags.js";
import { AnisotropyBlock } from "./anisotropyBlock.js";
import { ReflectionBlock } from "./reflectionBlock.js";
import { ClearCoatBlock } from "./clearCoatBlock.js";
import { IridescenceBlock } from "./iridescenceBlock.js";
import { SubSurfaceBlock } from "./subSurfaceBlock.js";

import { Color3, TmpColors } from "../../../../Maths/math.color.js";
var mapOutputToVariable = {
    ambientClr: ["finalAmbient", ""],
    diffuseDir: ["finalDiffuse", ""],
    specularDir: ["finalSpecularScaled", "!defined(UNLIT) && defined(SPECULARTERM)"],
    clearcoatDir: ["finalClearCoatScaled", "!defined(UNLIT) && defined(CLEARCOAT)"],
    sheenDir: ["finalSheenScaled", "!defined(UNLIT) && defined(SHEEN)"],
    diffuseInd: ["finalIrradiance", "!defined(UNLIT) && defined(REFLECTION)"],
    specularInd: ["finalRadianceScaled", "!defined(UNLIT) && defined(REFLECTION)"],
    clearcoatInd: ["clearcoatOut.finalClearCoatRadianceScaled", "!defined(UNLIT) && defined(REFLECTION) && defined(CLEARCOAT)"],
    sheenInd: ["sheenOut.finalSheenRadianceScaled", "!defined(UNLIT) && defined(REFLECTION) && defined(SHEEN) && defined(ENVIRONMENTBRDF)"],
    refraction: ["subSurfaceOut.finalRefraction", "!defined(UNLIT) && defined(SS_REFRACTION)"],
    lighting: ["finalColor.rgb", ""],
    shadow: ["shadow", ""],
    alpha: ["alpha", ""],
};
/**
 * Block used to implement the PBR metallic/roughness model
 */
var PBRMetallicRoughnessBlock = /** @class */ (function (_super) {
    __extends(PBRMetallicRoughnessBlock, _super);
    /**
     * Create a new ReflectionBlock
     * @param name defines the block name
     */
    function PBRMetallicRoughnessBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.VertexAndFragment) || this;
        _this._environmentBRDFTexture = null;
        _this._metallicReflectanceColor = Color3.White();
        _this._metallicF0Factor = 1;
        /**
         * Intensity of the direct lights e.g. the four lights available in your scene.
         * This impacts both the direct diffuse and specular highlights.
         */
        _this.directIntensity = 1.0;
        /**
         * Intensity of the environment e.g. how much the environment will light the object
         * either through harmonics for rough material or through the reflection for shiny ones.
         */
        _this.environmentIntensity = 1.0;
        /**
         * This is a special control allowing the reduction of the specular highlights coming from the
         * four lights of the scene. Those highlights may not be needed in full environment lighting.
         */
        _this.specularIntensity = 1.0;
        /**
         * Defines the  falloff type used in this material.
         * It by default is Physical.
         */
        _this.lightFalloff = 0;
        /**
         * Specifies that alpha test should be used
         */
        _this.useAlphaTest = false;
        /**
         * Defines the alpha limits in alpha test mode.
         */
        _this.alphaTestCutoff = 0.5;
        /**
         * Specifies that alpha blending should be used
         */
        _this.useAlphaBlending = false;
        /**
         * Specifies that the material will keeps the reflection highlights over a transparent surface (only the most luminous ones).
         * A car glass is a good example of that. When the street lights reflects on it you can not see what is behind.
         */
        _this.useRadianceOverAlpha = true;
        /**
         * Specifies that the material will keeps the specular highlights over a transparent surface (only the most luminous ones).
         * A car glass is a good example of that. When sun reflects on it you can not see what is behind.
         */
        _this.useSpecularOverAlpha = true;
        /**
         * Enables specular anti aliasing in the PBR shader.
         * It will both interacts on the Geometry for analytical and IBL lighting.
         * It also prefilter the roughness map based on the bump values.
         */
        _this.enableSpecularAntiAliasing = false;
        /**
         * Enables realtime filtering on the texture.
         */
        _this.realTimeFiltering = false;
        /**
         * Quality switch for realtime filtering
         */
        _this.realTimeFilteringQuality = 8;
        /**
         * Defines if the material uses energy conservation.
         */
        _this.useEnergyConservation = true;
        /**
         * This parameters will enable/disable radiance occlusion by preventing the radiance to lit
         * too much the area relying on ambient texture to define their ambient occlusion.
         */
        _this.useRadianceOcclusion = true;
        /**
         * This parameters will enable/disable Horizon occlusion to prevent normal maps to look shiny when the normal
         * makes the reflect vector face the model (under horizon).
         */
        _this.useHorizonOcclusion = true;
        /**
         * If set to true, no lighting calculations will be applied.
         */
        _this.unlit = false;
        /**
         * Force normal to face away from face.
         */
        _this.forceNormalForward = false;
        /**
         * Defines the material debug mode.
         * It helps seeing only some components of the material while troubleshooting.
         */
        _this.debugMode = 0;
        /**
         * Specify from where on screen the debug mode should start.
         * The value goes from -1 (full screen) to 1 (not visible)
         * It helps with side by side comparison against the final render
         * This defaults to 0
         */
        _this.debugLimit = 0;
        /**
         * As the default viewing range might not be enough (if the ambient is really small for instance)
         * You can use the factor to better multiply the final value.
         */
        _this.debugFactor = 1;
        _this._isUnique = true;
        _this.registerInput("worldPosition", NodeMaterialBlockConnectionPointTypes.Vector4, false, NodeMaterialBlockTargets.Vertex);
        _this.registerInput("worldNormal", NodeMaterialBlockConnectionPointTypes.Vector4, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("view", NodeMaterialBlockConnectionPointTypes.Matrix, false);
        _this.registerInput("cameraPosition", NodeMaterialBlockConnectionPointTypes.Vector3, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("perturbedNormal", NodeMaterialBlockConnectionPointTypes.Vector4, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("baseColor", NodeMaterialBlockConnectionPointTypes.Color3, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("metallic", NodeMaterialBlockConnectionPointTypes.Float, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("roughness", NodeMaterialBlockConnectionPointTypes.Float, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("ambientOcc", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("opacity", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("indexOfRefraction", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("ambientColor", NodeMaterialBlockConnectionPointTypes.Color3, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("reflection", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("reflection", _this, NodeMaterialConnectionPointDirection.Input, ReflectionBlock, "ReflectionBlock"));
        _this.registerInput("clearcoat", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("clearcoat", _this, NodeMaterialConnectionPointDirection.Input, ClearCoatBlock, "ClearCoatBlock"));
        _this.registerInput("sheen", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("sheen", _this, NodeMaterialConnectionPointDirection.Input, SheenBlock, "SheenBlock"));
        _this.registerInput("subsurface", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("subsurface", _this, NodeMaterialConnectionPointDirection.Input, SubSurfaceBlock, "SubSurfaceBlock"));
        _this.registerInput("anisotropy", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("anisotropy", _this, NodeMaterialConnectionPointDirection.Input, AnisotropyBlock, "AnisotropyBlock"));
        _this.registerInput("iridescence", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("iridescence", _this, NodeMaterialConnectionPointDirection.Input, IridescenceBlock, "IridescenceBlock"));
        _this.registerOutput("ambientClr", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("diffuseDir", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("specularDir", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("clearcoatDir", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("sheenDir", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("diffuseInd", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("specularInd", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("clearcoatInd", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("sheenInd", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("refraction", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("lighting", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("shadow", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("alpha", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        return _this;
    }
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    PBRMetallicRoughnessBlock.prototype.initialize = function (state) {
        state._excludeVariableName("vLightingIntensity");
        state._excludeVariableName("geometricNormalW");
        state._excludeVariableName("normalW");
        state._excludeVariableName("faceNormal");
        state._excludeVariableName("albedoOpacityOut");
        state._excludeVariableName("surfaceAlbedo");
        state._excludeVariableName("alpha");
        state._excludeVariableName("aoOut");
        state._excludeVariableName("baseColor");
        state._excludeVariableName("reflectivityOut");
        state._excludeVariableName("microSurface");
        state._excludeVariableName("roughness");
        state._excludeVariableName("NdotVUnclamped");
        state._excludeVariableName("NdotV");
        state._excludeVariableName("alphaG");
        state._excludeVariableName("AARoughnessFactors");
        state._excludeVariableName("environmentBrdf");
        state._excludeVariableName("ambientMonochrome");
        state._excludeVariableName("seo");
        state._excludeVariableName("eho");
        state._excludeVariableName("environmentRadiance");
        state._excludeVariableName("irradianceVector");
        state._excludeVariableName("environmentIrradiance");
        state._excludeVariableName("diffuseBase");
        state._excludeVariableName("specularBase");
        state._excludeVariableName("preInfo");
        state._excludeVariableName("info");
        state._excludeVariableName("shadow");
        state._excludeVariableName("finalDiffuse");
        state._excludeVariableName("finalAmbient");
        state._excludeVariableName("ambientOcclusionForDirectDiffuse");
        state._excludeVariableName("finalColor");
        state._excludeVariableName("vClipSpacePosition");
        state._excludeVariableName("vDebugMode");
    };
    /**
     * Gets the current class name
     * @returns the class name
     */
    PBRMetallicRoughnessBlock.prototype.getClassName = function () {
        return "PBRMetallicRoughnessBlock";
    };
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "worldPosition", {
        /**
         * Gets the world position input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "worldNormal", {
        /**
         * Gets the world normal input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "view", {
        /**
         * Gets the view matrix parameter
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "cameraPosition", {
        /**
         * Gets the camera position input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "perturbedNormal", {
        /**
         * Gets the perturbed normal input component
         */
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "baseColor", {
        /**
         * Gets the base color input component
         */
        get: function () {
            return this._inputs[5];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "metallic", {
        /**
         * Gets the metallic input component
         */
        get: function () {
            return this._inputs[6];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "roughness", {
        /**
         * Gets the roughness input component
         */
        get: function () {
            return this._inputs[7];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "ambientOcc", {
        /**
         * Gets the ambient occlusion input component
         */
        get: function () {
            return this._inputs[8];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "opacity", {
        /**
         * Gets the opacity input component
         */
        get: function () {
            return this._inputs[9];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "indexOfRefraction", {
        /**
         * Gets the index of refraction input component
         */
        get: function () {
            return this._inputs[10];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "ambientColor", {
        /**
         * Gets the ambient color input component
         */
        get: function () {
            return this._inputs[11];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "reflection", {
        /**
         * Gets the reflection object parameters
         */
        get: function () {
            return this._inputs[12];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "clearcoat", {
        /**
         * Gets the clear coat object parameters
         */
        get: function () {
            return this._inputs[13];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "sheen", {
        /**
         * Gets the sheen object parameters
         */
        get: function () {
            return this._inputs[14];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "subsurface", {
        /**
         * Gets the sub surface object parameters
         */
        get: function () {
            return this._inputs[15];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "anisotropy", {
        /**
         * Gets the anisotropy object parameters
         */
        get: function () {
            return this._inputs[16];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "iridescence", {
        /**
         * Gets the iridescence object parameters
         */
        get: function () {
            return this._inputs[17];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "ambientClr", {
        /**
         * Gets the ambient output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "diffuseDir", {
        /**
         * Gets the diffuse output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "specularDir", {
        /**
         * Gets the specular output component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "clearcoatDir", {
        /**
         * Gets the clear coat output component
         */
        get: function () {
            return this._outputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "sheenDir", {
        /**
         * Gets the sheen output component
         */
        get: function () {
            return this._outputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "diffuseInd", {
        /**
         * Gets the indirect diffuse output component
         */
        get: function () {
            return this._outputs[5];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "specularInd", {
        /**
         * Gets the indirect specular output component
         */
        get: function () {
            return this._outputs[6];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "clearcoatInd", {
        /**
         * Gets the indirect clear coat output component
         */
        get: function () {
            return this._outputs[7];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "sheenInd", {
        /**
         * Gets the indirect sheen output component
         */
        get: function () {
            return this._outputs[8];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "refraction", {
        /**
         * Gets the refraction output component
         */
        get: function () {
            return this._outputs[9];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "lighting", {
        /**
         * Gets the global lighting output component
         */
        get: function () {
            return this._outputs[10];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "shadow", {
        /**
         * Gets the shadow output component
         */
        get: function () {
            return this._outputs[11];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRMetallicRoughnessBlock.prototype, "alpha", {
        /**
         * Gets the alpha output component
         */
        get: function () {
            return this._outputs[12];
        },
        enumerable: false,
        configurable: true
    });
    PBRMetallicRoughnessBlock.prototype.autoConfigure = function (material) {
        if (!this.cameraPosition.isConnected) {
            var cameraPositionInput = material.getInputBlockByPredicate(function (b) { return b.systemValue === NodeMaterialSystemValues.CameraPosition; });
            if (!cameraPositionInput) {
                cameraPositionInput = new InputBlock("cameraPosition");
                cameraPositionInput.setAsSystemValue(NodeMaterialSystemValues.CameraPosition);
            }
            cameraPositionInput.output.connectTo(this.cameraPosition);
        }
        if (!this.view.isConnected) {
            var viewInput = material.getInputBlockByPredicate(function (b) { return b.systemValue === NodeMaterialSystemValues.View; });
            if (!viewInput) {
                viewInput = new InputBlock("view");
                viewInput.setAsSystemValue(NodeMaterialSystemValues.View);
            }
            viewInput.output.connectTo(this.view);
        }
    };
    PBRMetallicRoughnessBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        // General
        defines.setValue("PBR", true);
        defines.setValue("METALLICWORKFLOW", true);
        defines.setValue("DEBUGMODE", this.debugMode, true);
        defines.setValue("NORMALXYSCALE", true);
        defines.setValue("BUMP", this.perturbedNormal.isConnected, true);
        defines.setValue("LODBASEDMICROSFURACE", this._scene.getEngine().getCaps().textureLOD);
        // Albedo & Opacity
        defines.setValue("ALBEDO", false, true);
        defines.setValue("OPACITY", this.opacity.isConnected, true);
        // Ambient occlusion
        defines.setValue("AMBIENT", true, true);
        defines.setValue("AMBIENTINGRAYSCALE", false, true);
        // Reflectivity
        defines.setValue("REFLECTIVITY", false, true);
        defines.setValue("AOSTOREINMETALMAPRED", false, true);
        defines.setValue("METALLNESSSTOREINMETALMAPBLUE", false, true);
        defines.setValue("ROUGHNESSSTOREINMETALMAPALPHA", false, true);
        defines.setValue("ROUGHNESSSTOREINMETALMAPGREEN", false, true);
        // Lighting & colors
        if (this.lightFalloff === PBRBaseMaterial.LIGHTFALLOFF_STANDARD) {
            defines.setValue("USEPHYSICALLIGHTFALLOFF", false);
            defines.setValue("USEGLTFLIGHTFALLOFF", false);
        }
        else if (this.lightFalloff === PBRBaseMaterial.LIGHTFALLOFF_GLTF) {
            defines.setValue("USEPHYSICALLIGHTFALLOFF", false);
            defines.setValue("USEGLTFLIGHTFALLOFF", true);
        }
        else {
            defines.setValue("USEPHYSICALLIGHTFALLOFF", true);
            defines.setValue("USEGLTFLIGHTFALLOFF", false);
        }
        // Transparency
        var alphaTestCutOffString = this.alphaTestCutoff.toString();
        defines.setValue("ALPHABLEND", this.useAlphaBlending, true);
        defines.setValue("ALPHAFROMALBEDO", false, true);
        defines.setValue("ALPHATEST", this.useAlphaTest, true);
        defines.setValue("ALPHATESTVALUE", alphaTestCutOffString.indexOf(".") < 0 ? alphaTestCutOffString + "." : alphaTestCutOffString, true);
        defines.setValue("OPACITYRGB", false, true);
        // Rendering
        defines.setValue("RADIANCEOVERALPHA", this.useRadianceOverAlpha, true);
        defines.setValue("SPECULAROVERALPHA", this.useSpecularOverAlpha, true);
        defines.setValue("SPECULARAA", this._scene.getEngine().getCaps().standardDerivatives && this.enableSpecularAntiAliasing, true);
        defines.setValue("REALTIME_FILTERING", this.realTimeFiltering, true);
        var scene = mesh.getScene();
        if (scene.getEngine()._features.needTypeSuffixInShaderConstants) {
            defines.setValue("NUM_SAMPLES", this.realTimeFilteringQuality + "u", true);
        }
        else {
            defines.setValue("NUM_SAMPLES", "" + this.realTimeFilteringQuality, true);
        }
        // Advanced
        defines.setValue("BRDF_V_HEIGHT_CORRELATED", true);
        defines.setValue("MS_BRDF_ENERGY_CONSERVATION", this.useEnergyConservation, true);
        defines.setValue("RADIANCEOCCLUSION", this.useRadianceOcclusion, true);
        defines.setValue("HORIZONOCCLUSION", this.useHorizonOcclusion, true);
        defines.setValue("UNLIT", this.unlit, true);
        defines.setValue("FORCENORMALFORWARD", this.forceNormalForward, true);
        if (this._environmentBRDFTexture && MaterialFlags.ReflectionTextureEnabled) {
            defines.setValue("ENVIRONMENTBRDF", true);
            defines.setValue("ENVIRONMENTBRDF_RGBD", this._environmentBRDFTexture.isRGBD, true);
        }
        else {
            defines.setValue("ENVIRONMENTBRDF", false);
            defines.setValue("ENVIRONMENTBRDF_RGBD", false);
        }
        if (defines._areImageProcessingDirty && nodeMaterial.imageProcessingConfiguration) {
            nodeMaterial.imageProcessingConfiguration.prepareDefines(defines);
        }
        if (!defines._areLightsDirty) {
            return;
        }
        if (!this.light) {
            // Lights
            MaterialHelper.PrepareDefinesForLights(scene, mesh, defines, true, nodeMaterial.maxSimultaneousLights);
            defines._needNormals = true;
            // Multiview
            MaterialHelper.PrepareDefinesForMultiview(scene, defines);
        }
        else {
            var state = {
                needNormals: false,
                needRebuild: false,
                lightmapMode: false,
                shadowEnabled: false,
                specularEnabled: false,
            };
            MaterialHelper.PrepareDefinesForLight(scene, mesh, this.light, this._lightId, defines, true, state);
            if (state.needRebuild) {
                defines.rebuild();
            }
        }
    };
    PBRMetallicRoughnessBlock.prototype.updateUniformsAndSamples = function (state, nodeMaterial, defines, uniformBuffers) {
        for (var lightIndex = 0; lightIndex < nodeMaterial.maxSimultaneousLights; lightIndex++) {
            if (!defines["LIGHT" + lightIndex]) {
                break;
            }
            var onlyUpdateBuffersList = state.uniforms.indexOf("vLightData" + lightIndex) >= 0;
            MaterialHelper.PrepareUniformsAndSamplersForLight(lightIndex, state.uniforms, state.samplers, defines["PROJECTEDLIGHTTEXTURE" + lightIndex], uniformBuffers, onlyUpdateBuffersList);
        }
    };
    PBRMetallicRoughnessBlock.prototype.isReady = function (mesh, nodeMaterial, defines) {
        if (this._environmentBRDFTexture && !this._environmentBRDFTexture.isReady()) {
            return false;
        }
        if (defines._areImageProcessingDirty && nodeMaterial.imageProcessingConfiguration) {
            if (!nodeMaterial.imageProcessingConfiguration.isReady()) {
                return false;
            }
        }
        return true;
    };
    PBRMetallicRoughnessBlock.prototype.bind = function (effect, nodeMaterial, mesh) {
        var _a, _b;
        if (!mesh) {
            return;
        }
        var scene = mesh.getScene();
        if (!this.light) {
            MaterialHelper.BindLights(scene, mesh, effect, true, nodeMaterial.maxSimultaneousLights);
        }
        else {
            MaterialHelper.BindLight(this.light, this._lightId, scene, effect, true);
        }
        effect.setTexture(this._environmentBrdfSamplerName, this._environmentBRDFTexture);
        effect.setFloat2("vDebugMode", this.debugLimit, this.debugFactor);
        var ambientScene = this._scene.ambientColor;
        if (ambientScene) {
            effect.setColor3("ambientFromScene", ambientScene);
        }
        var invertNormal = scene.useRightHandedSystem === (scene._mirroredCameraPosition != null);
        effect.setFloat(this._invertNormalName, invertNormal ? -1 : 1);
        effect.setFloat4("vLightingIntensity", this.directIntensity, 1, this.environmentIntensity * this._scene.environmentIntensity, this.specularIntensity);
        // reflectivity bindings
        var outsideIOR = 1; // consider air as clear coat and other layers would remap in the shader.
        var ior = (_b = (_a = this.indexOfRefraction.connectInputBlock) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 1.5;
        // We are here deriving our default reflectance from a common value for none metallic surface.
        // Based of the schlick fresnel approximation model
        // for dielectrics.
        var f0 = Math.pow((ior - outsideIOR) / (ior + outsideIOR), 2);
        // Tweak the default F0 and F90 based on our given setup
        this._metallicReflectanceColor.scaleToRef(f0 * this._metallicF0Factor, TmpColors.Color3[0]);
        var metallicF90 = this._metallicF0Factor;
        effect.setColor4(this._vMetallicReflectanceFactorsName, TmpColors.Color3[0], metallicF90);
        if (nodeMaterial.imageProcessingConfiguration) {
            nodeMaterial.imageProcessingConfiguration.bind(effect);
        }
    };
    PBRMetallicRoughnessBlock.prototype._injectVertexCode = function (state) {
        var _a, _b;
        var worldPos = this.worldPosition;
        var comments = "//".concat(this.name);
        // Declaration
        if (!this.light) {
            // Emit for all lights
            state._emitFunctionFromInclude(state.supportUniformBuffers ? "lightVxUboDeclaration" : "lightVxFragmentDeclaration", comments, {
                repeatKey: "maxSimultaneousLights",
            });
            this._lightId = 0;
            state.sharedData.dynamicUniformBlocks.push(this);
        }
        else {
            this._lightId = (state.counters["lightCounter"] !== undefined ? state.counters["lightCounter"] : -1) + 1;
            state.counters["lightCounter"] = this._lightId;
            state._emitFunctionFromInclude(state.supportUniformBuffers ? "lightVxUboDeclaration" : "lightVxFragmentDeclaration", comments, {
                replaceStrings: [{ search: /{X}/g, replace: this._lightId.toString() }],
            }, this._lightId.toString());
        }
        // Inject code in vertex
        var worldPosVaryingName = "v_" + worldPos.associatedVariableName;
        if (state._emitVaryingFromString(worldPosVaryingName, "vec4")) {
            state.compilationString += "".concat(worldPosVaryingName, " = ").concat(worldPos.associatedVariableName, ";\r\n");
        }
        var reflectionBlock = this.reflection.isConnected ? (_a = this.reflection.connectedPoint) === null || _a === void 0 ? void 0 : _a.ownerBlock : null;
        if (reflectionBlock) {
            reflectionBlock.viewConnectionPoint = this.view;
        }
        state.compilationString += (_b = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock.handleVertexSide(state)) !== null && _b !== void 0 ? _b : "";
        state._emitUniformFromString("vDebugMode", "vec2", "defined(IGNORE) || DEBUGMODE > 0");
        state._emitUniformFromString("ambientFromScene", "vec3");
        if (state._emitVaryingFromString("vClipSpacePosition", "vec4", "defined(IGNORE) || DEBUGMODE > 0")) {
            state._injectAtEnd += "#if DEBUGMODE > 0\r\n";
            state._injectAtEnd += "vClipSpacePosition = gl_Position;\r\n";
            state._injectAtEnd += "#endif\r\n";
        }
        if (this.light) {
            state.compilationString += state._emitCodeFromInclude("shadowsVertex", comments, {
                replaceStrings: [
                    { search: /{X}/g, replace: this._lightId.toString() },
                    { search: /worldPos/g, replace: worldPos.associatedVariableName },
                ],
            });
        }
        else {
            state.compilationString += "vec4 worldPos = ".concat(worldPos.associatedVariableName, ";\r\n");
            if (this.view.isConnected) {
                state.compilationString += "mat4 view = ".concat(this.view.associatedVariableName, ";\r\n");
            }
            state.compilationString += state._emitCodeFromInclude("shadowsVertex", comments, {
                repeatKey: "maxSimultaneousLights",
            });
        }
    };
    PBRMetallicRoughnessBlock.prototype._getAlbedoOpacityCode = function () {
        var code = "albedoOpacityOutParams albedoOpacityOut;\r\n";
        var albedoColor = this.baseColor.isConnected ? this.baseColor.associatedVariableName : "vec3(1.)";
        var opacity = this.opacity.isConnected ? this.opacity.associatedVariableName : "1.";
        code += "albedoOpacityBlock(\n                vec4(".concat(albedoColor, ", 1.),\n            #ifdef ALBEDO\n                vec4(1.),\n                vec2(1., 1.),\n            #endif\n            #ifdef OPACITY\n                vec4(").concat(opacity, "),\n                vec2(1., 1.),\n            #endif\n                albedoOpacityOut\n            );\n\n            vec3 surfaceAlbedo = albedoOpacityOut.surfaceAlbedo;\n            float alpha = albedoOpacityOut.alpha;\r\n");
        return code;
    };
    PBRMetallicRoughnessBlock.prototype._getAmbientOcclusionCode = function () {
        var code = "ambientOcclusionOutParams aoOut;\r\n";
        var ao = this.ambientOcc.isConnected ? this.ambientOcc.associatedVariableName : "1.";
        code += "ambientOcclusionBlock(\n            #ifdef AMBIENT\n                vec3(".concat(ao, "),\n                vec4(0., 1.0, 1.0, 0.),\n            #endif\n                aoOut\n            );\r\n");
        return code;
    };
    PBRMetallicRoughnessBlock.prototype._getReflectivityCode = function (state) {
        var code = "reflectivityOutParams reflectivityOut;\r\n";
        var aoIntensity = "1.";
        this._vMetallicReflectanceFactorsName = state._getFreeVariableName("vMetallicReflectanceFactors");
        state._emitUniformFromString(this._vMetallicReflectanceFactorsName, "vec4");
        code += "vec3 baseColor = surfaceAlbedo;\n\n            reflectivityBlock(\n                vec4(".concat(this.metallic.associatedVariableName, ", ").concat(this.roughness.associatedVariableName, ", 0., 0.),\n            #ifdef METALLICWORKFLOW\n                surfaceAlbedo,\n                ").concat(this._vMetallicReflectanceFactorsName, ",\n            #endif\n            #ifdef REFLECTIVITY\n                vec3(0., 0., ").concat(aoIntensity, "),\n                vec4(1.),\n            #endif\n            #if defined(METALLICWORKFLOW) && defined(REFLECTIVITY)  && defined(AOSTOREINMETALMAPRED)\n                aoOut.ambientOcclusionColor,\n            #endif\n            #ifdef MICROSURFACEMAP\n                microSurfaceTexel, <== not handled!\n            #endif\n                reflectivityOut\n            );\n\n            float microSurface = reflectivityOut.microSurface;\n            float roughness = reflectivityOut.roughness;\n\n            #ifdef METALLICWORKFLOW\n                surfaceAlbedo = reflectivityOut.surfaceAlbedo;\n            #endif\n            #if defined(METALLICWORKFLOW) && defined(REFLECTIVITY) && defined(AOSTOREINMETALMAPRED)\n                aoOut.ambientOcclusionColor = reflectivityOut.ambientOcclusionColor;\n            #endif\r\n");
        return code;
    };
    PBRMetallicRoughnessBlock.prototype._buildBlock = function (state) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16;
        _super.prototype._buildBlock.call(this, state);
        this._scene = state.sharedData.scene;
        if (!this._environmentBRDFTexture) {
            this._environmentBRDFTexture = GetEnvironmentBRDFTexture(this._scene);
        }
        var reflectionBlock = this.reflection.isConnected ? (_a = this.reflection.connectedPoint) === null || _a === void 0 ? void 0 : _a.ownerBlock : null;
        if (reflectionBlock) {
            // Need those variables to be setup when calling _injectVertexCode
            reflectionBlock.worldPositionConnectionPoint = this.worldPosition;
            reflectionBlock.cameraPositionConnectionPoint = this.cameraPosition;
            reflectionBlock.worldNormalConnectionPoint = this.worldNormal;
        }
        if (state.target !== NodeMaterialBlockTargets.Fragment) {
            // Vertex
            this._injectVertexCode(state);
            return this;
        }
        // Fragment
        state.sharedData.forcedBindableBlocks.push(this);
        state.sharedData.blocksWithDefines.push(this);
        state.sharedData.blockingBlocks.push(this);
        var comments = "//".concat(this.name);
        var worldPosVarName = "v_" + this.worldPosition.associatedVariableName;
        var normalShading = this.perturbedNormal;
        this._environmentBrdfSamplerName = state._getFreeVariableName("environmentBrdfSampler");
        state._emit2DSampler(this._environmentBrdfSamplerName);
        state.sharedData.hints.needAlphaBlending = state.sharedData.hints.needAlphaBlending || this.useAlphaBlending;
        state.sharedData.hints.needAlphaTesting = state.sharedData.hints.needAlphaTesting || this.useAlphaTest;
        state._emitExtension("lod", "#extension GL_EXT_shader_texture_lod : enable", "defined(LODBASEDMICROSFURACE)");
        state._emitExtension("derivatives", "#extension GL_OES_standard_derivatives : enable");
        // Image processing uniforms
        state.uniforms.push("exposureLinear");
        state.uniforms.push("contrast");
        state.uniforms.push("vInverseScreenSize");
        state.uniforms.push("vignetteSettings1");
        state.uniforms.push("vignetteSettings2");
        state.uniforms.push("vCameraColorCurveNegative");
        state.uniforms.push("vCameraColorCurveNeutral");
        state.uniforms.push("vCameraColorCurvePositive");
        state.uniforms.push("txColorTransform");
        state.uniforms.push("colorTransformSettings");
        //
        // Includes
        //
        if (!this.light) {
            // Emit for all lights
            state._emitFunctionFromInclude(state.supportUniformBuffers ? "lightUboDeclaration" : "lightFragmentDeclaration", comments, {
                repeatKey: "maxSimultaneousLights",
            });
        }
        else {
            state._emitFunctionFromInclude(state.supportUniformBuffers ? "lightUboDeclaration" : "lightFragmentDeclaration", comments, {
                replaceStrings: [{ search: /{X}/g, replace: this._lightId.toString() }],
            }, this._lightId.toString());
        }
        state._emitFunctionFromInclude("helperFunctions", comments);
        state._emitFunctionFromInclude("importanceSampling", comments);
        state._emitFunctionFromInclude("pbrHelperFunctions", comments);
        state._emitFunctionFromInclude("imageProcessingDeclaration", comments);
        state._emitFunctionFromInclude("imageProcessingFunctions", comments);
        state._emitFunctionFromInclude("shadowsFragmentFunctions", comments, {
            replaceStrings: [{ search: /vPositionW/g, replace: worldPosVarName + ".xyz" }],
        });
        state._emitFunctionFromInclude("pbrDirectLightingSetupFunctions", comments, {
            replaceStrings: [{ search: /vPositionW/g, replace: worldPosVarName + ".xyz" }],
        });
        state._emitFunctionFromInclude("pbrDirectLightingFalloffFunctions", comments);
        state._emitFunctionFromInclude("pbrBRDFFunctions", comments, {
            replaceStrings: [{ search: /REFLECTIONMAP_SKYBOX/g, replace: (_b = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineSkyboxName) !== null && _b !== void 0 ? _b : "REFLECTIONMAP_SKYBOX" }],
        });
        state._emitFunctionFromInclude("hdrFilteringFunctions", comments);
        state._emitFunctionFromInclude("pbrDirectLightingFunctions", comments, {
            replaceStrings: [{ search: /vPositionW/g, replace: worldPosVarName + ".xyz" }],
        });
        state._emitFunctionFromInclude("pbrIBLFunctions", comments);
        state._emitFunctionFromInclude("pbrBlockAlbedoOpacity", comments);
        state._emitFunctionFromInclude("pbrBlockReflectivity", comments);
        state._emitFunctionFromInclude("pbrBlockAmbientOcclusion", comments);
        state._emitFunctionFromInclude("pbrBlockAlphaFresnel", comments);
        state._emitFunctionFromInclude("pbrBlockAnisotropic", comments);
        //
        // code
        //
        state._emitUniformFromString("vLightingIntensity", "vec4");
        // _____________________________ Geometry Information ____________________________
        this._vNormalWName = state._getFreeVariableName("vNormalW");
        state.compilationString += "vec4 ".concat(this._vNormalWName, " = normalize(").concat(this.worldNormal.associatedVariableName, ");\r\n");
        if (state._registerTempVariable("viewDirectionW")) {
            state.compilationString += "vec3 viewDirectionW = normalize(".concat(this.cameraPosition.associatedVariableName, " - ").concat(worldPosVarName, ".xyz);\r\n");
        }
        state.compilationString += "vec3 geometricNormalW = ".concat(this._vNormalWName, ".xyz;\r\n");
        state.compilationString += "vec3 normalW = ".concat(normalShading.isConnected ? "normalize(" + normalShading.associatedVariableName + ".xyz)" : "geometricNormalW", ";\r\n");
        this._invertNormalName = state._getFreeVariableName("invertNormal");
        state._emitUniformFromString(this._invertNormalName, "float");
        state.compilationString += state._emitCodeFromInclude("pbrBlockNormalFinal", comments, {
            replaceStrings: [
                { search: /vPositionW/g, replace: worldPosVarName + ".xyz" },
                { search: /vEyePosition.w/g, replace: this._invertNormalName },
            ],
        });
        // _____________________________ Albedo & Opacity ______________________________
        state.compilationString += this._getAlbedoOpacityCode();
        state.compilationString += state._emitCodeFromInclude("depthPrePass", comments);
        // _____________________________ AO  _______________________________
        state.compilationString += this._getAmbientOcclusionCode();
        state.compilationString += state._emitCodeFromInclude("pbrBlockLightmapInit", comments);
        // _____________________________ UNLIT  _______________________________
        state.compilationString += "#ifdef UNLIT\n                vec3 diffuseBase = vec3(1., 1., 1.);\n            #else\r\n";
        // _____________________________ Reflectivity _______________________________
        state.compilationString += this._getReflectivityCode(state);
        // _____________________________ Geometry info _________________________________
        state.compilationString += state._emitCodeFromInclude("pbrBlockGeometryInfo", comments, {
            replaceStrings: [
                { search: /REFLECTIONMAP_SKYBOX/g, replace: (_c = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineSkyboxName) !== null && _c !== void 0 ? _c : "REFLECTIONMAP_SKYBOX" },
                { search: /REFLECTIONMAP_3D/g, replace: (_d = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName) !== null && _d !== void 0 ? _d : "REFLECTIONMAP_3D" },
            ],
        });
        // _____________________________ Anisotropy _______________________________________
        var anisotropyBlock = this.anisotropy.isConnected ? (_e = this.anisotropy.connectedPoint) === null || _e === void 0 ? void 0 : _e.ownerBlock : null;
        if (anisotropyBlock) {
            anisotropyBlock.worldPositionConnectionPoint = this.worldPosition;
            anisotropyBlock.worldNormalConnectionPoint = this.worldNormal;
            state.compilationString += anisotropyBlock.getCode(state, !this.perturbedNormal.isConnected);
        }
        // _____________________________ Reflection _______________________________________
        if (reflectionBlock && reflectionBlock.hasTexture) {
            state.compilationString += reflectionBlock.getCode(state, anisotropyBlock ? "anisotropicOut.anisotropicNormal" : "normalW");
        }
        state._emitFunctionFromInclude("pbrBlockReflection", comments, {
            replaceStrings: [
                { search: /computeReflectionCoords/g, replace: "computeReflectionCoordsPBR" },
                { search: /REFLECTIONMAP_3D/g, replace: (_f = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName) !== null && _f !== void 0 ? _f : "REFLECTIONMAP_3D" },
                { search: /REFLECTIONMAP_OPPOSITEZ/g, replace: (_g = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineOppositeZ) !== null && _g !== void 0 ? _g : "REFLECTIONMAP_OPPOSITEZ" },
                { search: /REFLECTIONMAP_PROJECTION/g, replace: (_h = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineProjectionName) !== null && _h !== void 0 ? _h : "REFLECTIONMAP_PROJECTION" },
                { search: /REFLECTIONMAP_SKYBOX/g, replace: (_j = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineSkyboxName) !== null && _j !== void 0 ? _j : "REFLECTIONMAP_SKYBOX" },
                { search: /LODINREFLECTIONALPHA/g, replace: (_k = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineLODReflectionAlpha) !== null && _k !== void 0 ? _k : "LODINREFLECTIONALPHA" },
                { search: /LINEARSPECULARREFLECTION/g, replace: (_l = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineLinearSpecularReflection) !== null && _l !== void 0 ? _l : "LINEARSPECULARREFLECTION" },
                { search: /vReflectionFilteringInfo/g, replace: (_m = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._vReflectionFilteringInfoName) !== null && _m !== void 0 ? _m : "vReflectionFilteringInfo" },
            ],
        });
        // ___________________ Compute Reflectance aka R0 F0 info _________________________
        state.compilationString += state._emitCodeFromInclude("pbrBlockReflectance0", comments, {
            replaceStrings: [{ search: /metallicReflectanceFactors/g, replace: this._vMetallicReflectanceFactorsName }],
        });
        // ________________________________ Sheen ______________________________
        var sheenBlock = this.sheen.isConnected ? (_o = this.sheen.connectedPoint) === null || _o === void 0 ? void 0 : _o.ownerBlock : null;
        if (sheenBlock) {
            state.compilationString += sheenBlock.getCode(reflectionBlock);
        }
        state._emitFunctionFromInclude("pbrBlockSheen", comments, {
            replaceStrings: [
                { search: /REFLECTIONMAP_3D/g, replace: (_p = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName) !== null && _p !== void 0 ? _p : "REFLECTIONMAP_3D" },
                { search: /REFLECTIONMAP_SKYBOX/g, replace: (_q = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineSkyboxName) !== null && _q !== void 0 ? _q : "REFLECTIONMAP_SKYBOX" },
                { search: /LODINREFLECTIONALPHA/g, replace: (_r = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineLODReflectionAlpha) !== null && _r !== void 0 ? _r : "LODINREFLECTIONALPHA" },
                { search: /LINEARSPECULARREFLECTION/g, replace: (_s = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineLinearSpecularReflection) !== null && _s !== void 0 ? _s : "LINEARSPECULARREFLECTION" },
            ],
        });
        // _____________________________ Iridescence _______________________________
        var iridescenceBlock = this.iridescence.isConnected ? (_t = this.iridescence.connectedPoint) === null || _t === void 0 ? void 0 : _t.ownerBlock : null;
        state.compilationString += IridescenceBlock.GetCode(iridescenceBlock);
        state._emitFunctionFromInclude("pbrBlockIridescence", comments, {
            replaceStrings: [],
        });
        // _____________________________ Clear Coat ____________________________
        var clearcoatBlock = this.clearcoat.isConnected ? (_u = this.clearcoat.connectedPoint) === null || _u === void 0 ? void 0 : _u.ownerBlock : null;
        var generateTBNSpace = !this.perturbedNormal.isConnected && !this.anisotropy.isConnected;
        var isTangentConnectedToPerturbNormal = this.perturbedNormal.isConnected && ((_w = ((_v = this.perturbedNormal.connectedPoint) === null || _v === void 0 ? void 0 : _v.ownerBlock).worldTangent) === null || _w === void 0 ? void 0 : _w.isConnected);
        var isTangentConnectedToAnisotropy = this.anisotropy.isConnected && ((_x = this.anisotropy.connectedPoint) === null || _x === void 0 ? void 0 : _x.ownerBlock).worldTangent.isConnected;
        var vTBNAvailable = isTangentConnectedToPerturbNormal || (!this.perturbedNormal.isConnected && isTangentConnectedToAnisotropy);
        state.compilationString += ClearCoatBlock.GetCode(state, clearcoatBlock, reflectionBlock, worldPosVarName, generateTBNSpace, vTBNAvailable, this.worldNormal.associatedVariableName);
        if (generateTBNSpace) {
            vTBNAvailable = (_y = clearcoatBlock === null || clearcoatBlock === void 0 ? void 0 : clearcoatBlock.worldTangent.isConnected) !== null && _y !== void 0 ? _y : false;
        }
        state._emitFunctionFromInclude("pbrBlockClearcoat", comments, {
            replaceStrings: [
                { search: /computeReflectionCoords/g, replace: "computeReflectionCoordsPBR" },
                { search: /REFLECTIONMAP_3D/g, replace: (_z = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName) !== null && _z !== void 0 ? _z : "REFLECTIONMAP_3D" },
                { search: /REFLECTIONMAP_OPPOSITEZ/g, replace: (_0 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineOppositeZ) !== null && _0 !== void 0 ? _0 : "REFLECTIONMAP_OPPOSITEZ" },
                { search: /REFLECTIONMAP_PROJECTION/g, replace: (_1 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineProjectionName) !== null && _1 !== void 0 ? _1 : "REFLECTIONMAP_PROJECTION" },
                { search: /REFLECTIONMAP_SKYBOX/g, replace: (_2 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineSkyboxName) !== null && _2 !== void 0 ? _2 : "REFLECTIONMAP_SKYBOX" },
                { search: /LODINREFLECTIONALPHA/g, replace: (_3 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineLODReflectionAlpha) !== null && _3 !== void 0 ? _3 : "LODINREFLECTIONALPHA" },
                { search: /LINEARSPECULARREFLECTION/g, replace: (_4 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineLinearSpecularReflection) !== null && _4 !== void 0 ? _4 : "LINEARSPECULARREFLECTION" },
                { search: /defined\(TANGENT\)/g, replace: vTBNAvailable ? "defined(TANGENT)" : "defined(IGNORE)" },
            ],
        });
        // _________________________ Specular Environment Reflectance __________________________
        state.compilationString += state._emitCodeFromInclude("pbrBlockReflectance", comments, {
            replaceStrings: [
                { search: /REFLECTIONMAP_SKYBOX/g, replace: (_5 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineSkyboxName) !== null && _5 !== void 0 ? _5 : "REFLECTIONMAP_SKYBOX" },
                { search: /REFLECTIONMAP_3D/g, replace: (_6 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName) !== null && _6 !== void 0 ? _6 : "REFLECTIONMAP_3D" },
            ],
        });
        // ___________________________________ SubSurface ______________________________________
        var subsurfaceBlock = this.subsurface.isConnected ? (_7 = this.subsurface.connectedPoint) === null || _7 === void 0 ? void 0 : _7.ownerBlock : null;
        var refractionBlock = this.subsurface.isConnected
            ? (_9 = ((_8 = this.subsurface.connectedPoint) === null || _8 === void 0 ? void 0 : _8.ownerBlock).refraction.connectedPoint) === null || _9 === void 0 ? void 0 : _9.ownerBlock
            : null;
        if (refractionBlock) {
            refractionBlock.viewConnectionPoint = this.view;
            refractionBlock.indexOfRefractionConnectionPoint = this.indexOfRefraction;
        }
        state.compilationString += SubSurfaceBlock.GetCode(state, subsurfaceBlock, reflectionBlock, worldPosVarName);
        state._emitFunctionFromInclude("pbrBlockSubSurface", comments, {
            replaceStrings: [
                { search: /REFLECTIONMAP_3D/g, replace: (_10 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName) !== null && _10 !== void 0 ? _10 : "REFLECTIONMAP_3D" },
                { search: /REFLECTIONMAP_OPPOSITEZ/g, replace: (_11 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineOppositeZ) !== null && _11 !== void 0 ? _11 : "REFLECTIONMAP_OPPOSITEZ" },
                { search: /REFLECTIONMAP_PROJECTION/g, replace: (_12 = reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineProjectionName) !== null && _12 !== void 0 ? _12 : "REFLECTIONMAP_PROJECTION" },
                { search: /SS_REFRACTIONMAP_3D/g, replace: (_13 = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._define3DName) !== null && _13 !== void 0 ? _13 : "SS_REFRACTIONMAP_3D" },
                { search: /SS_LODINREFRACTIONALPHA/g, replace: (_14 = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._defineLODRefractionAlpha) !== null && _14 !== void 0 ? _14 : "SS_LODINREFRACTIONALPHA" },
                { search: /SS_LINEARSPECULARREFRACTION/g, replace: (_15 = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._defineLinearSpecularRefraction) !== null && _15 !== void 0 ? _15 : "SS_LINEARSPECULARREFRACTION" },
                { search: /SS_REFRACTIONMAP_OPPOSITEZ/g, replace: (_16 = refractionBlock === null || refractionBlock === void 0 ? void 0 : refractionBlock._defineOppositeZ) !== null && _16 !== void 0 ? _16 : "SS_REFRACTIONMAP_OPPOSITEZ" },
            ],
        });
        // _____________________________ Direct Lighting Info __________________________________
        state.compilationString += state._emitCodeFromInclude("pbrBlockDirectLighting", comments);
        if (this.light) {
            state.compilationString += state._emitCodeFromInclude("lightFragment", comments, {
                replaceStrings: [{ search: /{X}/g, replace: this._lightId.toString() }],
            });
        }
        else {
            state.compilationString += state._emitCodeFromInclude("lightFragment", comments, {
                repeatKey: "maxSimultaneousLights",
            });
        }
        // _____________________________ Compute Final Lit Components ________________________
        state.compilationString += state._emitCodeFromInclude("pbrBlockFinalLitComponents", comments);
        // _____________________________ UNLIT (2) ________________________
        state.compilationString += "#endif\r\n"; // UNLIT
        // _____________________________ Compute Final Unlit Components ________________________
        var aoColor = this.ambientColor.isConnected ? this.ambientColor.associatedVariableName : "vec3(0., 0., 0.)";
        var aoDirectLightIntensity = PBRBaseMaterial.DEFAULT_AO_ON_ANALYTICAL_LIGHTS.toString();
        if (aoDirectLightIntensity.indexOf(".") === -1) {
            aoDirectLightIntensity += ".";
        }
        state.compilationString += state._emitCodeFromInclude("pbrBlockFinalUnlitComponents", comments, {
            replaceStrings: [
                { search: /vec3 finalEmissive[\s\S]*?finalEmissive\*=vLightingIntensity\.y;/g, replace: "" },
                { search: /vAmbientColor/g, replace: aoColor + " * ambientFromScene" },
                { search: /vAmbientInfos\.w/g, replace: aoDirectLightIntensity },
            ],
        });
        // _____________________________ Output Final Color Composition ________________________
        state.compilationString += state._emitCodeFromInclude("pbrBlockFinalColorComposition", comments, {
            replaceStrings: [{ search: /finalEmissive/g, replace: "vec3(0.)" }],
        });
        // _____________________________ Apply image processing ________________________
        state.compilationString += state._emitCodeFromInclude("pbrBlockImageProcessing", comments, {
            replaceStrings: [{ search: /visibility/g, replace: "1." }],
        });
        // _____________________________ Generate debug code ________________________
        state.compilationString += state._emitCodeFromInclude("pbrDebug", comments, {
            replaceStrings: [
                { search: /vNormalW/g, replace: this._vNormalWName },
                { search: /vPositionW/g, replace: worldPosVarName },
                { search: /albedoTexture\.rgb;/g, replace: "vec3(1.);\r\ngl_FragColor.rgb = toGammaSpace(gl_FragColor.rgb);\r\n" },
            ],
        });
        // _____________________________ Generate end points ________________________
        for (var _i = 0, _17 = this._outputs; _i < _17.length; _i++) {
            var output = _17[_i];
            if (output.hasEndpoints) {
                var remap = mapOutputToVariable[output.name];
                if (remap) {
                    var varName = remap[0], conditions = remap[1];
                    if (conditions) {
                        state.compilationString += "#if ".concat(conditions, "\r\n");
                    }
                    state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(varName, ";\r\n");
                    if (conditions) {
                        state.compilationString += "#else\r\n";
                        state.compilationString += "".concat(this._declareOutput(output, state), " = vec3(0.);\r\n");
                        state.compilationString += "#endif\r\n";
                    }
                }
                else {
                    console.error("There's no remapping for the ".concat(output.name, " end point! No code generated"));
                }
            }
        }
        return this;
    };
    PBRMetallicRoughnessBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".lightFalloff = ").concat(this.lightFalloff, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".useAlphaTest = ").concat(this.useAlphaTest, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".alphaTestCutoff = ").concat(this.alphaTestCutoff, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".useAlphaBlending = ").concat(this.useAlphaBlending, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".useRadianceOverAlpha = ").concat(this.useRadianceOverAlpha, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".useSpecularOverAlpha = ").concat(this.useSpecularOverAlpha, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".enableSpecularAntiAliasing = ").concat(this.enableSpecularAntiAliasing, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".realTimeFiltering = ").concat(this.realTimeFiltering, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".realTimeFilteringQuality = ").concat(this.realTimeFilteringQuality, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".useEnergyConservation = ").concat(this.useEnergyConservation, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".useRadianceOcclusion = ").concat(this.useRadianceOcclusion, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".useHorizonOcclusion = ").concat(this.useHorizonOcclusion, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".unlit = ").concat(this.unlit, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".forceNormalForward = ").concat(this.forceNormalForward, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".debugMode = ").concat(this.debugMode, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".debugLimit = ").concat(this.debugLimit, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".debugFactor = ").concat(this.debugFactor, ";\r\n");
        return codeString;
    };
    PBRMetallicRoughnessBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        if (this.light) {
            serializationObject.lightId = this.light.id;
        }
        serializationObject.lightFalloff = this.lightFalloff;
        serializationObject.useAlphaTest = this.useAlphaTest;
        serializationObject.alphaTestCutoff = this.alphaTestCutoff;
        serializationObject.useAlphaBlending = this.useAlphaBlending;
        serializationObject.useRadianceOverAlpha = this.useRadianceOverAlpha;
        serializationObject.useSpecularOverAlpha = this.useSpecularOverAlpha;
        serializationObject.enableSpecularAntiAliasing = this.enableSpecularAntiAliasing;
        serializationObject.realTimeFiltering = this.realTimeFiltering;
        serializationObject.realTimeFilteringQuality = this.realTimeFilteringQuality;
        serializationObject.useEnergyConservation = this.useEnergyConservation;
        serializationObject.useRadianceOcclusion = this.useRadianceOcclusion;
        serializationObject.useHorizonOcclusion = this.useHorizonOcclusion;
        serializationObject.unlit = this.unlit;
        serializationObject.forceNormalForward = this.forceNormalForward;
        serializationObject.debugMode = this.debugMode;
        serializationObject.debugLimit = this.debugLimit;
        serializationObject.debugFactor = this.debugFactor;
        return serializationObject;
    };
    PBRMetallicRoughnessBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        var _a, _b;
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        if (serializationObject.lightId) {
            this.light = scene.getLightById(serializationObject.lightId);
        }
        this.lightFalloff = (_a = serializationObject.lightFalloff) !== null && _a !== void 0 ? _a : 0;
        this.useAlphaTest = serializationObject.useAlphaTest;
        this.alphaTestCutoff = serializationObject.alphaTestCutoff;
        this.useAlphaBlending = serializationObject.useAlphaBlending;
        this.useRadianceOverAlpha = serializationObject.useRadianceOverAlpha;
        this.useSpecularOverAlpha = serializationObject.useSpecularOverAlpha;
        this.enableSpecularAntiAliasing = serializationObject.enableSpecularAntiAliasing;
        this.realTimeFiltering = !!serializationObject.realTimeFiltering;
        this.realTimeFilteringQuality = (_b = serializationObject.realTimeFilteringQuality) !== null && _b !== void 0 ? _b : 8;
        this.useEnergyConservation = serializationObject.useEnergyConservation;
        this.useRadianceOcclusion = serializationObject.useRadianceOcclusion;
        this.useHorizonOcclusion = serializationObject.useHorizonOcclusion;
        this.unlit = serializationObject.unlit;
        this.forceNormalForward = !!serializationObject.forceNormalForward;
        this.debugMode = serializationObject.debugMode;
        this.debugLimit = serializationObject.debugLimit;
        this.debugFactor = serializationObject.debugFactor;
    };
    __decorate([
        editableInPropertyPage("Direct lights", PropertyTypeForEdition.Float, "INTENSITY", { min: 0, max: 1, notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "directIntensity", void 0);
    __decorate([
        editableInPropertyPage("Environment lights", PropertyTypeForEdition.Float, "INTENSITY", { min: 0, max: 1, notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "environmentIntensity", void 0);
    __decorate([
        editableInPropertyPage("Specular highlights", PropertyTypeForEdition.Float, "INTENSITY", { min: 0, max: 1, notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "specularIntensity", void 0);
    __decorate([
        editableInPropertyPage("Light falloff", PropertyTypeForEdition.List, "LIGHTING & COLORS", {
            notifiers: { update: true },
            options: [
                { label: "Physical", value: PBRBaseMaterial.LIGHTFALLOFF_PHYSICAL },
                { label: "GLTF", value: PBRBaseMaterial.LIGHTFALLOFF_GLTF },
                { label: "Standard", value: PBRBaseMaterial.LIGHTFALLOFF_STANDARD },
            ],
        })
    ], PBRMetallicRoughnessBlock.prototype, "lightFalloff", void 0);
    __decorate([
        editableInPropertyPage("Alpha Testing", PropertyTypeForEdition.Boolean, "OPACITY")
    ], PBRMetallicRoughnessBlock.prototype, "useAlphaTest", void 0);
    __decorate([
        editableInPropertyPage("Alpha CutOff", PropertyTypeForEdition.Float, "OPACITY", { min: 0, max: 1, notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "alphaTestCutoff", void 0);
    __decorate([
        editableInPropertyPage("Alpha blending", PropertyTypeForEdition.Boolean, "OPACITY")
    ], PBRMetallicRoughnessBlock.prototype, "useAlphaBlending", void 0);
    __decorate([
        editableInPropertyPage("Radiance over alpha", PropertyTypeForEdition.Boolean, "RENDERING", { notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "useRadianceOverAlpha", void 0);
    __decorate([
        editableInPropertyPage("Specular over alpha", PropertyTypeForEdition.Boolean, "RENDERING", { notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "useSpecularOverAlpha", void 0);
    __decorate([
        editableInPropertyPage("Specular anti-aliasing", PropertyTypeForEdition.Boolean, "RENDERING", { notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "enableSpecularAntiAliasing", void 0);
    __decorate([
        editableInPropertyPage("Realtime filtering", PropertyTypeForEdition.Boolean, "RENDERING", { notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "realTimeFiltering", void 0);
    __decorate([
        editableInPropertyPage("Realtime filtering quality", PropertyTypeForEdition.List, "RENDERING", {
            notifiers: { update: true },
            options: [
                { label: "Low", value: 8 },
                { label: "Medium", value: 16 },
                { label: "High", value: 64 },
            ],
        })
    ], PBRMetallicRoughnessBlock.prototype, "realTimeFilteringQuality", void 0);
    __decorate([
        editableInPropertyPage("Energy Conservation", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "useEnergyConservation", void 0);
    __decorate([
        editableInPropertyPage("Radiance occlusion", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "useRadianceOcclusion", void 0);
    __decorate([
        editableInPropertyPage("Horizon occlusion", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "useHorizonOcclusion", void 0);
    __decorate([
        editableInPropertyPage("Unlit", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "unlit", void 0);
    __decorate([
        editableInPropertyPage("Force normal forward", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "forceNormalForward", void 0);
    __decorate([
        editableInPropertyPage("Debug mode", PropertyTypeForEdition.List, "DEBUG", {
            notifiers: { update: true },
            options: [
                { label: "None", value: 0 },
                // Geometry
                { label: "Normalized position", value: 1 },
                { label: "Normals", value: 2 },
                { label: "Tangents", value: 3 },
                { label: "Bitangents", value: 4 },
                { label: "Bump Normals", value: 5 },
                //{ label: "UV1", value: 6 },
                //{ label: "UV2", value: 7 },
                { label: "ClearCoat Normals", value: 8 },
                { label: "ClearCoat Tangents", value: 9 },
                { label: "ClearCoat Bitangents", value: 10 },
                { label: "Anisotropic Normals", value: 11 },
                { label: "Anisotropic Tangents", value: 12 },
                { label: "Anisotropic Bitangents", value: 13 },
                // Maps
                //{ label: "Emissive Map", value: 23 },
                //{ label: "Light Map", value: 24 },
                // Env
                { label: "Env Refraction", value: 40 },
                { label: "Env Reflection", value: 41 },
                { label: "Env Clear Coat", value: 42 },
                // Lighting
                { label: "Direct Diffuse", value: 50 },
                { label: "Direct Specular", value: 51 },
                { label: "Direct Clear Coat", value: 52 },
                { label: "Direct Sheen", value: 53 },
                { label: "Env Irradiance", value: 54 },
                // Lighting Params
                { label: "Surface Albedo", value: 60 },
                { label: "Reflectance 0", value: 61 },
                { label: "Metallic", value: 62 },
                { label: "Metallic F0", value: 71 },
                { label: "Roughness", value: 63 },
                { label: "AlphaG", value: 64 },
                { label: "NdotV", value: 65 },
                { label: "ClearCoat Color", value: 66 },
                { label: "ClearCoat Roughness", value: 67 },
                { label: "ClearCoat NdotV", value: 68 },
                { label: "Transmittance", value: 69 },
                { label: "Refraction Transmittance", value: 70 },
                // Misc
                { label: "SEO", value: 80 },
                { label: "EHO", value: 81 },
                { label: "Energy Factor", value: 82 },
                { label: "Specular Reflectance", value: 83 },
                { label: "Clear Coat Reflectance", value: 84 },
                { label: "Sheen Reflectance", value: 85 },
                { label: "Luminance Over Alpha", value: 86 },
                { label: "Alpha", value: 87 },
            ],
        })
    ], PBRMetallicRoughnessBlock.prototype, "debugMode", void 0);
    __decorate([
        editableInPropertyPage("Split position", PropertyTypeForEdition.Float, "DEBUG", { min: -1, max: 1, notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "debugLimit", void 0);
    __decorate([
        editableInPropertyPage("Output factor", PropertyTypeForEdition.Float, "DEBUG", { min: 0, max: 5, notifiers: { update: true } })
    ], PBRMetallicRoughnessBlock.prototype, "debugFactor", void 0);
    return PBRMetallicRoughnessBlock;
}(NodeMaterialBlock));
export { PBRMetallicRoughnessBlock };
RegisterClass("BABYLON.PBRMetallicRoughnessBlock", PBRMetallicRoughnessBlock);
//# sourceMappingURL=pbrMetallicRoughnessBlock.js.map