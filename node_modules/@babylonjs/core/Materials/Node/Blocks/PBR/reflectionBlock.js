import { __decorate, __extends } from "tslib";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { ReflectionTextureBaseBlock } from "../Dual/reflectionTextureBaseBlock.js";
import { Texture } from "../../../Textures/texture.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../../nodeMaterialDecorator.js";
import { Scalar } from "../../../../Maths/math.scalar.js";
/**
 * Block used to implement the reflection module of the PBR material
 */
var ReflectionBlock = /** @class */ (function (_super) {
    __extends(ReflectionBlock, _super);
    /**
     * Create a new ReflectionBlock
     * @param name defines the block name
     */
    function ReflectionBlock(name) {
        var _this = _super.call(this, name) || this;
        /**
         * Defines if the material uses spherical harmonics vs spherical polynomials for the
         * diffuse part of the IBL.
         */
        _this.useSphericalHarmonics = true;
        /**
         * Force the shader to compute irradiance in the fragment shader in order to take bump in account.
         */
        _this.forceIrradianceInFragment = false;
        _this._isUnique = true;
        _this.registerInput("position", NodeMaterialBlockConnectionPointTypes.Vector3, false, NodeMaterialBlockTargets.Vertex);
        _this.registerInput("world", NodeMaterialBlockConnectionPointTypes.Matrix, false, NodeMaterialBlockTargets.Vertex);
        _this.registerInput("color", NodeMaterialBlockConnectionPointTypes.Color3, true, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("reflection", NodeMaterialBlockConnectionPointTypes.Object, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("reflection", _this, NodeMaterialConnectionPointDirection.Output, ReflectionBlock, "ReflectionBlock"));
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ReflectionBlock.prototype.getClassName = function () {
        return "ReflectionBlock";
    };
    Object.defineProperty(ReflectionBlock.prototype, "position", {
        /**
         * Gets the position input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionBlock.prototype, "worldPosition", {
        /**
         * Gets the world position input component
         */
        get: function () {
            return this.worldPositionConnectionPoint;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionBlock.prototype, "worldNormal", {
        /**
         * Gets the world normal input component
         */
        get: function () {
            return this.worldNormalConnectionPoint;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionBlock.prototype, "world", {
        /**
         * Gets the world input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionBlock.prototype, "cameraPosition", {
        /**
         * Gets the camera (or eye) position component
         */
        get: function () {
            return this.cameraPositionConnectionPoint;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionBlock.prototype, "view", {
        /**
         * Gets the view input component
         */
        get: function () {
            return this.viewConnectionPoint;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionBlock.prototype, "color", {
        /**
         * Gets the color input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionBlock.prototype, "reflection", {
        /**
         * Gets the reflection object output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionBlock.prototype, "hasTexture", {
        /**
         * Returns true if the block has a texture (either its own texture or the environment texture from the scene, if set)
         */
        get: function () {
            return !!this._getTexture();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionBlock.prototype, "reflectionColor", {
        /**
         * Gets the reflection color (either the name of the variable if the color input is connected, else a default value)
         */
        get: function () {
            return this.color.isConnected ? this.color.associatedVariableName : "vec3(1., 1., 1.)";
        },
        enumerable: false,
        configurable: true
    });
    ReflectionBlock.prototype._getTexture = function () {
        if (this.texture) {
            return this.texture;
        }
        return this._scene.environmentTexture;
    };
    ReflectionBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        _super.prototype.prepareDefines.call(this, mesh, nodeMaterial, defines);
        var reflectionTexture = this._getTexture();
        var reflection = reflectionTexture && reflectionTexture.getTextureMatrix;
        defines.setValue("REFLECTION", reflection, true);
        if (!reflection) {
            return;
        }
        defines.setValue(this._defineLODReflectionAlpha, reflectionTexture.lodLevelInAlpha, true);
        defines.setValue(this._defineLinearSpecularReflection, reflectionTexture.linearSpecularLOD, true);
        defines.setValue(this._defineOppositeZ, this._scene.useRightHandedSystem ? !reflectionTexture.invertZ : reflectionTexture.invertZ, true);
        defines.setValue("SPHERICAL_HARMONICS", this.useSphericalHarmonics, true);
        defines.setValue("GAMMAREFLECTION", reflectionTexture.gammaSpace, true);
        defines.setValue("RGBDREFLECTION", reflectionTexture.isRGBD, true);
        if (reflectionTexture && reflectionTexture.coordinatesMode !== Texture.SKYBOX_MODE) {
            if (reflectionTexture.isCube) {
                defines.setValue("USESPHERICALFROMREFLECTIONMAP", true);
                defines.setValue("USEIRRADIANCEMAP", false);
                if (this.forceIrradianceInFragment || this._scene.getEngine().getCaps().maxVaryingVectors <= 8) {
                    defines.setValue("USESPHERICALINVERTEX", false);
                }
                else {
                    defines.setValue("USESPHERICALINVERTEX", true);
                }
            }
        }
    };
    ReflectionBlock.prototype.bind = function (effect, nodeMaterial, mesh, subMesh) {
        _super.prototype.bind.call(this, effect, nodeMaterial, mesh);
        var reflectionTexture = this._getTexture();
        if (!reflectionTexture || !subMesh) {
            return;
        }
        if (reflectionTexture.isCube) {
            effect.setTexture(this._cubeSamplerName, reflectionTexture);
        }
        else {
            effect.setTexture(this._2DSamplerName, reflectionTexture);
        }
        var width = reflectionTexture.getSize().width;
        effect.setFloat3(this._vReflectionMicrosurfaceInfosName, width, reflectionTexture.lodGenerationScale, reflectionTexture.lodGenerationOffset);
        effect.setFloat2(this._vReflectionFilteringInfoName, width, Scalar.Log2(width));
        var defines = subMesh.materialDefines;
        var polynomials = reflectionTexture.sphericalPolynomial;
        if (defines.USESPHERICALFROMREFLECTIONMAP && polynomials) {
            if (defines.SPHERICAL_HARMONICS) {
                var preScaledHarmonics = polynomials.preScaledHarmonics;
                effect.setVector3("vSphericalL00", preScaledHarmonics.l00);
                effect.setVector3("vSphericalL1_1", preScaledHarmonics.l1_1);
                effect.setVector3("vSphericalL10", preScaledHarmonics.l10);
                effect.setVector3("vSphericalL11", preScaledHarmonics.l11);
                effect.setVector3("vSphericalL2_2", preScaledHarmonics.l2_2);
                effect.setVector3("vSphericalL2_1", preScaledHarmonics.l2_1);
                effect.setVector3("vSphericalL20", preScaledHarmonics.l20);
                effect.setVector3("vSphericalL21", preScaledHarmonics.l21);
                effect.setVector3("vSphericalL22", preScaledHarmonics.l22);
            }
            else {
                effect.setFloat3("vSphericalX", polynomials.x.x, polynomials.x.y, polynomials.x.z);
                effect.setFloat3("vSphericalY", polynomials.y.x, polynomials.y.y, polynomials.y.z);
                effect.setFloat3("vSphericalZ", polynomials.z.x, polynomials.z.y, polynomials.z.z);
                effect.setFloat3("vSphericalXX_ZZ", polynomials.xx.x - polynomials.zz.x, polynomials.xx.y - polynomials.zz.y, polynomials.xx.z - polynomials.zz.z);
                effect.setFloat3("vSphericalYY_ZZ", polynomials.yy.x - polynomials.zz.x, polynomials.yy.y - polynomials.zz.y, polynomials.yy.z - polynomials.zz.z);
                effect.setFloat3("vSphericalZZ", polynomials.zz.x, polynomials.zz.y, polynomials.zz.z);
                effect.setFloat3("vSphericalXY", polynomials.xy.x, polynomials.xy.y, polynomials.xy.z);
                effect.setFloat3("vSphericalYZ", polynomials.yz.x, polynomials.yz.y, polynomials.yz.z);
                effect.setFloat3("vSphericalZX", polynomials.zx.x, polynomials.zx.y, polynomials.zx.z);
            }
        }
    };
    /**
     * Gets the code to inject in the vertex shader
     * @param state current state of the node material building
     * @returns the shader code
     */
    ReflectionBlock.prototype.handleVertexSide = function (state) {
        var code = _super.prototype.handleVertexSide.call(this, state);
        state._emitFunctionFromInclude("harmonicsFunctions", "//".concat(this.name), {
            replaceStrings: [
                { search: /uniform vec3 vSphericalL00;[\s\S]*?uniform vec3 vSphericalL22;/g, replace: "" },
                { search: /uniform vec3 vSphericalX;[\s\S]*?uniform vec3 vSphericalZX;/g, replace: "" },
            ],
        });
        var reflectionVectorName = state._getFreeVariableName("reflectionVector");
        this._vEnvironmentIrradianceName = state._getFreeVariableName("vEnvironmentIrradiance");
        state._emitVaryingFromString(this._vEnvironmentIrradianceName, "vec3", "defined(USESPHERICALFROMREFLECTIONMAP) && defined(USESPHERICALINVERTEX)");
        state._emitUniformFromString("vSphericalL00", "vec3", "SPHERICAL_HARMONICS");
        state._emitUniformFromString("vSphericalL1_1", "vec3", "SPHERICAL_HARMONICS");
        state._emitUniformFromString("vSphericalL10", "vec3", "SPHERICAL_HARMONICS");
        state._emitUniformFromString("vSphericalL11", "vec3", "SPHERICAL_HARMONICS");
        state._emitUniformFromString("vSphericalL2_2", "vec3", "SPHERICAL_HARMONICS");
        state._emitUniformFromString("vSphericalL2_1", "vec3", "SPHERICAL_HARMONICS");
        state._emitUniformFromString("vSphericalL20", "vec3", "SPHERICAL_HARMONICS");
        state._emitUniformFromString("vSphericalL21", "vec3", "SPHERICAL_HARMONICS");
        state._emitUniformFromString("vSphericalL22", "vec3", "SPHERICAL_HARMONICS");
        state._emitUniformFromString("vSphericalX", "vec3", "SPHERICAL_HARMONICS", true);
        state._emitUniformFromString("vSphericalY", "vec3", "SPHERICAL_HARMONICS", true);
        state._emitUniformFromString("vSphericalZ", "vec3", "SPHERICAL_HARMONICS", true);
        state._emitUniformFromString("vSphericalXX_ZZ", "vec3", "SPHERICAL_HARMONICS", true);
        state._emitUniformFromString("vSphericalYY_ZZ", "vec3", "SPHERICAL_HARMONICS", true);
        state._emitUniformFromString("vSphericalZZ", "vec3", "SPHERICAL_HARMONICS", true);
        state._emitUniformFromString("vSphericalXY", "vec3", "SPHERICAL_HARMONICS", true);
        state._emitUniformFromString("vSphericalYZ", "vec3", "SPHERICAL_HARMONICS", true);
        state._emitUniformFromString("vSphericalZX", "vec3", "SPHERICAL_HARMONICS", true);
        code += "#if defined(USESPHERICALFROMREFLECTIONMAP) && defined(USESPHERICALINVERTEX)\n                vec3 ".concat(reflectionVectorName, " = vec3(").concat(this._reflectionMatrixName, " * vec4(normalize(").concat(this.worldNormal.associatedVariableName, ").xyz, 0)).xyz;\n                #ifdef ").concat(this._defineOppositeZ, "\n                    ").concat(reflectionVectorName, ".z *= -1.0;\n                #endif\n                ").concat(this._vEnvironmentIrradianceName, " = computeEnvironmentIrradiance(").concat(reflectionVectorName, ");\n            #endif\r\n");
        return code;
    };
    /**
     * Gets the main code of the block (fragment side)
     * @param state current state of the node material building
     * @param normalVarName name of the existing variable corresponding to the normal
     * @returns the shader code
     */
    ReflectionBlock.prototype.getCode = function (state, normalVarName) {
        var code = "";
        this.handleFragmentSideInits(state);
        state._emitFunctionFromInclude("harmonicsFunctions", "//".concat(this.name), {
            replaceStrings: [
                { search: /uniform vec3 vSphericalL00;[\s\S]*?uniform vec3 vSphericalL22;/g, replace: "" },
                { search: /uniform vec3 vSphericalX;[\s\S]*?uniform vec3 vSphericalZX;/g, replace: "" },
            ],
        });
        state._emitFunction("sampleReflection", "\n            #ifdef ".concat(this._define3DName, "\n                #define sampleReflection(s, c) textureCube(s, c)\n            #else\n                #define sampleReflection(s, c) texture2D(s, c)\n            #endif\r\n"), "//".concat(this.name));
        state._emitFunction("sampleReflectionLod", "\n            #ifdef ".concat(this._define3DName, "\n                #define sampleReflectionLod(s, c, l) textureCubeLodEXT(s, c, l)\n            #else\n                #define sampleReflectionLod(s, c, l) texture2DLodEXT(s, c, l)\n            #endif\r\n"), "//".concat(this.name));
        var computeReflectionCoordsFunc = "\n            vec3 computeReflectionCoordsPBR(vec4 worldPos, vec3 worldNormal) {\n                ".concat(this.handleFragmentSideCodeReflectionCoords("worldNormal", "worldPos", true, true), "\n                return ").concat(this._reflectionVectorName, ";\n            }\r\n");
        state._emitFunction("computeReflectionCoordsPBR", computeReflectionCoordsFunc, "//".concat(this.name));
        this._vReflectionMicrosurfaceInfosName = state._getFreeVariableName("vReflectionMicrosurfaceInfos");
        state._emitUniformFromString(this._vReflectionMicrosurfaceInfosName, "vec3");
        this._vReflectionInfosName = state._getFreeVariableName("vReflectionInfos");
        this._vReflectionFilteringInfoName = state._getFreeVariableName("vReflectionFilteringInfo");
        state._emitUniformFromString(this._vReflectionFilteringInfoName, "vec2");
        code += "#ifdef REFLECTION\n            vec2 ".concat(this._vReflectionInfosName, " = vec2(1., 0.);\n\n            reflectionOutParams reflectionOut;\n\n            reflectionBlock(\n                ").concat("v_" + this.worldPosition.associatedVariableName + ".xyz", ",\n                ").concat(normalVarName, ",\n                alphaG,\n                ").concat(this._vReflectionMicrosurfaceInfosName, ",\n                ").concat(this._vReflectionInfosName, ",\n                ").concat(this.reflectionColor, ",\n            #ifdef ANISOTROPIC\n                anisotropicOut,\n            #endif\n            #if defined(").concat(this._defineLODReflectionAlpha, ") && !defined(").concat(this._defineSkyboxName, ")\n                NdotVUnclamped,\n            #endif\n            #ifdef ").concat(this._defineLinearSpecularReflection, "\n                roughness,\n            #endif\n            #ifdef ").concat(this._define3DName, "\n                ").concat(this._cubeSamplerName, ",\n            #else\n                ").concat(this._2DSamplerName, ",\n            #endif\n            #if defined(NORMAL) && defined(USESPHERICALINVERTEX)\n                ").concat(this._vEnvironmentIrradianceName, ",\n            #endif\n            #ifdef USESPHERICALFROMREFLECTIONMAP\n                #if !defined(NORMAL) || !defined(USESPHERICALINVERTEX)\n                    ").concat(this._reflectionMatrixName, ",\n                #endif\n            #endif\n            #ifdef USEIRRADIANCEMAP\n                irradianceSampler, // ** not handled **\n            #endif\n            #ifndef LODBASEDMICROSFURACE\n                #ifdef ").concat(this._define3DName, "\n                    ").concat(this._cubeSamplerName, ",\n                    ").concat(this._cubeSamplerName, ",\n                #else\n                    ").concat(this._2DSamplerName, ",\n                    ").concat(this._2DSamplerName, ",\n                #endif\n            #endif\n            #ifdef REALTIME_FILTERING\n                ").concat(this._vReflectionFilteringInfoName, ",\n            #endif\n                reflectionOut\n            );\n        #endif\r\n");
        return code;
    };
    ReflectionBlock.prototype._buildBlock = function (state) {
        this._scene = state.sharedData.scene;
        if (state.target !== NodeMaterialBlockTargets.Fragment) {
            this._defineLODReflectionAlpha = state._getFreeDefineName("LODINREFLECTIONALPHA");
            this._defineLinearSpecularReflection = state._getFreeDefineName("LINEARSPECULARREFLECTION");
        }
        return this;
    };
    ReflectionBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        if (this.texture) {
            codeString += "".concat(this._codeVariableName, ".texture.gammaSpace = ").concat(this.texture.gammaSpace, ";\r\n");
        }
        codeString += "".concat(this._codeVariableName, ".useSphericalHarmonics = ").concat(this.useSphericalHarmonics, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".forceIrradianceInFragment = ").concat(this.forceIrradianceInFragment, ";\r\n");
        return codeString;
    };
    ReflectionBlock.prototype.serialize = function () {
        var _a, _b;
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.useSphericalHarmonics = this.useSphericalHarmonics;
        serializationObject.forceIrradianceInFragment = this.forceIrradianceInFragment;
        serializationObject.gammaSpace = (_b = (_a = this.texture) === null || _a === void 0 ? void 0 : _a.gammaSpace) !== null && _b !== void 0 ? _b : true;
        return serializationObject;
    };
    ReflectionBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.useSphericalHarmonics = serializationObject.useSphericalHarmonics;
        this.forceIrradianceInFragment = serializationObject.forceIrradianceInFragment;
        if (this.texture) {
            this.texture.gammaSpace = serializationObject.gammaSpace;
        }
    };
    __decorate([
        editableInPropertyPage("Spherical Harmonics", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], ReflectionBlock.prototype, "useSphericalHarmonics", void 0);
    __decorate([
        editableInPropertyPage("Force irradiance in fragment", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], ReflectionBlock.prototype, "forceIrradianceInFragment", void 0);
    return ReflectionBlock;
}(ReflectionTextureBaseBlock));
export { ReflectionBlock };
RegisterClass("BABYLON.ReflectionBlock", ReflectionBlock);
//# sourceMappingURL=reflectionBlock.js.map