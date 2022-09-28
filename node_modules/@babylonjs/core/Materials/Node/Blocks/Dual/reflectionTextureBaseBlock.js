import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { InputBlock } from "../Input/inputBlock.js";
import { NodeMaterialSystemValues } from "../../Enums/nodeMaterialSystemValues.js";

import "../../../../Shaders/ShadersInclude/reflectionFunction.js";
import { CubeTexture } from "../../../Textures/cubeTexture.js";
import { Texture } from "../../../Textures/texture.js";
import { EngineStore } from "../../../../Engines/engineStore.js";
/**
 * Base block used to read a reflection texture from a sampler
 */
var ReflectionTextureBaseBlock = /** @class */ (function (_super) {
    __extends(ReflectionTextureBaseBlock, _super);
    /**
     * Create a new ReflectionTextureBaseBlock
     * @param name defines the block name
     */
    function ReflectionTextureBaseBlock(name) {
        return _super.call(this, name, NodeMaterialBlockTargets.VertexAndFragment) || this;
    }
    Object.defineProperty(ReflectionTextureBaseBlock.prototype, "texture", {
        /**
         * Gets or sets the texture associated with the node
         */
        get: function () {
            return this._texture;
        },
        set: function (texture) {
            var _this = this;
            var _a;
            if (this._texture === texture) {
                return;
            }
            var scene = (_a = texture === null || texture === void 0 ? void 0 : texture.getScene()) !== null && _a !== void 0 ? _a : EngineStore.LastCreatedScene;
            if (!texture && scene) {
                scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(_this._texture);
                });
            }
            this._texture = texture;
            if (texture && scene) {
                scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(texture);
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the current class name
     * @returns the class name
     */
    ReflectionTextureBaseBlock.prototype.getClassName = function () {
        return "ReflectionTextureBaseBlock";
    };
    ReflectionTextureBaseBlock.prototype._getTexture = function () {
        return this.texture;
    };
    ReflectionTextureBaseBlock.prototype.autoConfigure = function (material) {
        if (!this.position.isConnected) {
            var positionInput = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "position"; });
            if (!positionInput) {
                positionInput = new InputBlock("position");
                positionInput.setAsAttribute();
            }
            positionInput.output.connectTo(this.position);
        }
        if (!this.world.isConnected) {
            var worldInput = material.getInputBlockByPredicate(function (b) { return b.systemValue === NodeMaterialSystemValues.World; });
            if (!worldInput) {
                worldInput = new InputBlock("world");
                worldInput.setAsSystemValue(NodeMaterialSystemValues.World);
            }
            worldInput.output.connectTo(this.world);
        }
        if (this.view && !this.view.isConnected) {
            var viewInput = material.getInputBlockByPredicate(function (b) { return b.systemValue === NodeMaterialSystemValues.View; });
            if (!viewInput) {
                viewInput = new InputBlock("view");
                viewInput.setAsSystemValue(NodeMaterialSystemValues.View);
            }
            viewInput.output.connectTo(this.view);
        }
    };
    ReflectionTextureBaseBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        if (!defines._areTexturesDirty) {
            return;
        }
        var texture = this._getTexture();
        if (!texture || !texture.getTextureMatrix) {
            return;
        }
        defines.setValue(this._define3DName, texture.isCube, true);
        defines.setValue(this._defineLocalCubicName, texture.boundingBoxSize ? true : false, true);
        defines.setValue(this._defineExplicitName, texture.coordinatesMode === 0, true);
        defines.setValue(this._defineSkyboxName, texture.coordinatesMode === 5, true);
        defines.setValue(this._defineCubicName, texture.coordinatesMode === 3 || texture.coordinatesMode === 6, true);
        defines.setValue("INVERTCUBICMAP", texture.coordinatesMode === 6, true);
        defines.setValue(this._defineSphericalName, texture.coordinatesMode === 1, true);
        defines.setValue(this._definePlanarName, texture.coordinatesMode === 2, true);
        defines.setValue(this._defineProjectionName, texture.coordinatesMode === 4, true);
        defines.setValue(this._defineEquirectangularName, texture.coordinatesMode === 7, true);
        defines.setValue(this._defineEquirectangularFixedName, texture.coordinatesMode === 8, true);
        defines.setValue(this._defineMirroredEquirectangularFixedName, texture.coordinatesMode === 9, true);
    };
    ReflectionTextureBaseBlock.prototype.isReady = function () {
        var texture = this._getTexture();
        if (texture && !texture.isReadyOrNotBlocking()) {
            return false;
        }
        return true;
    };
    ReflectionTextureBaseBlock.prototype.bind = function (effect, nodeMaterial, mesh) {
        var texture = this._getTexture();
        if (!mesh || !texture) {
            return;
        }
        effect.setMatrix(this._reflectionMatrixName, texture.getReflectionTextureMatrix());
        if (texture.isCube) {
            effect.setTexture(this._cubeSamplerName, texture);
        }
        else {
            effect.setTexture(this._2DSamplerName, texture);
        }
        if (texture.boundingBoxSize) {
            var cubeTexture = texture;
            effect.setVector3(this._reflectionPositionName, cubeTexture.boundingBoxPosition);
            effect.setVector3(this._reflectionSizeName, cubeTexture.boundingBoxSize);
        }
    };
    /**
     * Gets the code to inject in the vertex shader
     * @param state current state of the node material building
     * @returns the shader code
     */
    ReflectionTextureBaseBlock.prototype.handleVertexSide = function (state) {
        this._define3DName = state._getFreeDefineName("REFLECTIONMAP_3D");
        this._defineCubicName = state._getFreeDefineName("REFLECTIONMAP_CUBIC");
        this._defineSphericalName = state._getFreeDefineName("REFLECTIONMAP_SPHERICAL");
        this._definePlanarName = state._getFreeDefineName("REFLECTIONMAP_PLANAR");
        this._defineProjectionName = state._getFreeDefineName("REFLECTIONMAP_PROJECTION");
        this._defineExplicitName = state._getFreeDefineName("REFLECTIONMAP_EXPLICIT");
        this._defineEquirectangularName = state._getFreeDefineName("REFLECTIONMAP_EQUIRECTANGULAR");
        this._defineLocalCubicName = state._getFreeDefineName("USE_LOCAL_REFLECTIONMAP_CUBIC");
        this._defineMirroredEquirectangularFixedName = state._getFreeDefineName("REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED");
        this._defineEquirectangularFixedName = state._getFreeDefineName("REFLECTIONMAP_EQUIRECTANGULAR_FIXED");
        this._defineSkyboxName = state._getFreeDefineName("REFLECTIONMAP_SKYBOX");
        this._defineOppositeZ = state._getFreeDefineName("REFLECTIONMAP_OPPOSITEZ");
        this._reflectionMatrixName = state._getFreeVariableName("reflectionMatrix");
        state._emitUniformFromString(this._reflectionMatrixName, "mat4");
        var code = "";
        var worldPosVaryingName = "v_" + this.worldPosition.associatedVariableName;
        if (state._emitVaryingFromString(worldPosVaryingName, "vec4")) {
            code += "".concat(worldPosVaryingName, " = ").concat(this.worldPosition.associatedVariableName, ";\r\n");
        }
        this._positionUVWName = state._getFreeVariableName("positionUVW");
        this._directionWName = state._getFreeVariableName("directionW");
        if (state._emitVaryingFromString(this._positionUVWName, "vec3", this._defineSkyboxName)) {
            code += "#ifdef ".concat(this._defineSkyboxName, "\r\n");
            code += "".concat(this._positionUVWName, " = ").concat(this.position.associatedVariableName, ".xyz;\r\n");
            code += "#endif\r\n";
        }
        if (state._emitVaryingFromString(this._directionWName, "vec3", "defined(".concat(this._defineEquirectangularFixedName, ") || defined(").concat(this._defineMirroredEquirectangularFixedName, ")"))) {
            code += "#if defined(".concat(this._defineEquirectangularFixedName, ") || defined(").concat(this._defineMirroredEquirectangularFixedName, ")\r\n");
            code += "".concat(this._directionWName, " = normalize(vec3(").concat(this.world.associatedVariableName, " * vec4(").concat(this.position.associatedVariableName, ".xyz, 0.0)));\r\n");
            code += "#endif\r\n";
        }
        return code;
    };
    /**
     * Handles the inits for the fragment code path
     * @param state node material build state
     */
    ReflectionTextureBaseBlock.prototype.handleFragmentSideInits = function (state) {
        state.sharedData.blockingBlocks.push(this);
        state.sharedData.textureBlocks.push(this);
        // Samplers
        this._cubeSamplerName = state._getFreeVariableName(this.name + "CubeSampler");
        state.samplers.push(this._cubeSamplerName);
        this._2DSamplerName = state._getFreeVariableName(this.name + "2DSampler");
        state.samplers.push(this._2DSamplerName);
        state._samplerDeclaration += "#ifdef ".concat(this._define3DName, "\r\n");
        state._samplerDeclaration += "uniform samplerCube ".concat(this._cubeSamplerName, ";\r\n");
        state._samplerDeclaration += "#else\r\n";
        state._samplerDeclaration += "uniform sampler2D ".concat(this._2DSamplerName, ";\r\n");
        state._samplerDeclaration += "#endif\r\n";
        // Fragment
        state.sharedData.blocksWithDefines.push(this);
        state.sharedData.bindableBlocks.push(this);
        var comments = "//".concat(this.name);
        state._emitFunction("ReciprocalPI", "#define RECIPROCAL_PI2 0.15915494", "");
        state._emitFunctionFromInclude("helperFunctions", comments);
        state._emitFunctionFromInclude("reflectionFunction", comments, {
            replaceStrings: [{ search: /vec3 computeReflectionCoords/g, replace: "void DUMMYFUNC" }],
        });
        this._reflectionColorName = state._getFreeVariableName("reflectionColor");
        this._reflectionVectorName = state._getFreeVariableName("reflectionUVW");
        this._reflectionCoordsName = state._getFreeVariableName("reflectionCoords");
        this._reflectionPositionName = state._getFreeVariableName("vReflectionPosition");
        state._emitUniformFromString(this._reflectionPositionName, "vec3");
        this._reflectionSizeName = state._getFreeVariableName("vReflectionPosition");
        state._emitUniformFromString(this._reflectionSizeName, "vec3");
    };
    /**
     * Generates the reflection coords code for the fragment code path
     * @param worldNormalVarName name of the world normal variable
     * @param worldPos name of the world position variable. If not provided, will use the world position connected to this block
     * @param onlyReflectionVector if true, generates code only for the reflection vector computation, not for the reflection coordinates
     * @param doNotEmitInvertZ if true, does not emit the invertZ code
     * @returns the shader code
     */
    ReflectionTextureBaseBlock.prototype.handleFragmentSideCodeReflectionCoords = function (worldNormalVarName, worldPos, onlyReflectionVector, doNotEmitInvertZ) {
        if (onlyReflectionVector === void 0) { onlyReflectionVector = false; }
        if (doNotEmitInvertZ === void 0) { doNotEmitInvertZ = false; }
        if (!worldPos) {
            worldPos = "v_".concat(this.worldPosition.associatedVariableName);
        }
        var reflectionMatrix = this._reflectionMatrixName;
        var direction = "normalize(".concat(this._directionWName, ")");
        var positionUVW = "".concat(this._positionUVWName);
        var vEyePosition = "".concat(this.cameraPosition.associatedVariableName);
        var view = "".concat(this.view.associatedVariableName);
        worldNormalVarName += ".xyz";
        var code = "\n            #ifdef ".concat(this._defineMirroredEquirectangularFixedName, "\n                vec3 ").concat(this._reflectionVectorName, " = computeMirroredFixedEquirectangularCoords(").concat(worldPos, ", ").concat(worldNormalVarName, ", ").concat(direction, ");\n            #endif\n\n            #ifdef ").concat(this._defineEquirectangularFixedName, "\n                vec3 ").concat(this._reflectionVectorName, " = computeFixedEquirectangularCoords(").concat(worldPos, ", ").concat(worldNormalVarName, ", ").concat(direction, ");\n            #endif\n\n            #ifdef ").concat(this._defineEquirectangularName, "\n                vec3 ").concat(this._reflectionVectorName, " = computeEquirectangularCoords(").concat(worldPos, ", ").concat(worldNormalVarName, ", ").concat(vEyePosition, ".xyz, ").concat(reflectionMatrix, ");\n            #endif\n\n            #ifdef ").concat(this._defineSphericalName, "\n                vec3 ").concat(this._reflectionVectorName, " = computeSphericalCoords(").concat(worldPos, ", ").concat(worldNormalVarName, ", ").concat(view, ", ").concat(reflectionMatrix, ");\n            #endif\n\n            #ifdef ").concat(this._definePlanarName, "\n                vec3 ").concat(this._reflectionVectorName, " = computePlanarCoords(").concat(worldPos, ", ").concat(worldNormalVarName, ", ").concat(vEyePosition, ".xyz, ").concat(reflectionMatrix, ");\n            #endif\n\n            #ifdef ").concat(this._defineCubicName, "\n                #ifdef ").concat(this._defineLocalCubicName, "\n                    vec3 ").concat(this._reflectionVectorName, " = computeCubicLocalCoords(").concat(worldPos, ", ").concat(worldNormalVarName, ", ").concat(vEyePosition, ".xyz, ").concat(reflectionMatrix, ", ").concat(this._reflectionSizeName, ", ").concat(this._reflectionPositionName, ");\n                #else\n                vec3 ").concat(this._reflectionVectorName, " = computeCubicCoords(").concat(worldPos, ", ").concat(worldNormalVarName, ", ").concat(vEyePosition, ".xyz, ").concat(reflectionMatrix, ");\n                #endif\n            #endif\n\n            #ifdef ").concat(this._defineProjectionName, "\n                vec3 ").concat(this._reflectionVectorName, " = computeProjectionCoords(").concat(worldPos, ", ").concat(view, ", ").concat(reflectionMatrix, ");\n            #endif\n\n            #ifdef ").concat(this._defineSkyboxName, "\n                vec3 ").concat(this._reflectionVectorName, " = computeSkyBoxCoords(").concat(positionUVW, ", ").concat(reflectionMatrix, ");\n            #endif\n\n            #ifdef ").concat(this._defineExplicitName, "\n                vec3 ").concat(this._reflectionVectorName, " = vec3(0, 0, 0);\n            #endif\r\n");
        if (!doNotEmitInvertZ) {
            code += "#ifdef ".concat(this._defineOppositeZ, "\n                ").concat(this._reflectionVectorName, ".z *= -1.0;\n            #endif\r\n");
        }
        if (!onlyReflectionVector) {
            code += "\n                #ifdef ".concat(this._define3DName, "\n                    vec3 ").concat(this._reflectionCoordsName, " = ").concat(this._reflectionVectorName, ";\n                #else\n                    vec2 ").concat(this._reflectionCoordsName, " = ").concat(this._reflectionVectorName, ".xy;\n                    #ifdef ").concat(this._defineProjectionName, "\n                        ").concat(this._reflectionCoordsName, " /= ").concat(this._reflectionVectorName, ".z;\n                    #endif\n                    ").concat(this._reflectionCoordsName, ".y = 1.0 - ").concat(this._reflectionCoordsName, ".y;\n                #endif\r\n");
        }
        return code;
    };
    /**
     * Generates the reflection color code for the fragment code path
     * @param lodVarName name of the lod variable
     * @param swizzleLookupTexture swizzle to use for the final color variable
     * @returns the shader code
     */
    ReflectionTextureBaseBlock.prototype.handleFragmentSideCodeReflectionColor = function (lodVarName, swizzleLookupTexture) {
        if (swizzleLookupTexture === void 0) { swizzleLookupTexture = ".rgb"; }
        var colorType = "vec" + (swizzleLookupTexture.length === 0 ? "4" : swizzleLookupTexture.length - 1);
        var code = "".concat(colorType, " ").concat(this._reflectionColorName, ";\n            #ifdef ").concat(this._define3DName, "\r\n");
        if (lodVarName) {
            code += "".concat(this._reflectionColorName, " = textureCubeLodEXT(").concat(this._cubeSamplerName, ", ").concat(this._reflectionVectorName, ", ").concat(lodVarName, ")").concat(swizzleLookupTexture, ";\r\n");
        }
        else {
            code += "".concat(this._reflectionColorName, " = textureCube(").concat(this._cubeSamplerName, ", ").concat(this._reflectionVectorName, ")").concat(swizzleLookupTexture, ";\r\n");
        }
        code += "\n            #else\r\n";
        if (lodVarName) {
            code += "".concat(this._reflectionColorName, " = texture2DLodEXT(").concat(this._2DSamplerName, ", ").concat(this._reflectionCoordsName, ", ").concat(lodVarName, ")").concat(swizzleLookupTexture, ";\r\n");
        }
        else {
            code += "".concat(this._reflectionColorName, " = texture2D(").concat(this._2DSamplerName, ", ").concat(this._reflectionCoordsName, ")").concat(swizzleLookupTexture, ";\r\n");
        }
        code += "#endif\r\n";
        return code;
    };
    /**
     * Generates the code corresponding to the connected output points
     * @param state node material build state
     * @param varName name of the variable to output
     * @returns the shader code
     */
    ReflectionTextureBaseBlock.prototype.writeOutputs = function (state, varName) {
        var code = "";
        if (state.target === NodeMaterialBlockTargets.Fragment) {
            for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
                var output = _a[_i];
                if (output.hasEndpoints) {
                    code += "".concat(this._declareOutput(output, state), " = ").concat(varName, ".").concat(output.name, ";\r\n");
                }
            }
        }
        return code;
    };
    ReflectionTextureBaseBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        return this;
    };
    ReflectionTextureBaseBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        if (!this.texture) {
            return codeString;
        }
        if (this.texture.isCube) {
            var forcedExtension = this.texture.forcedExtension;
            codeString += "".concat(this._codeVariableName, ".texture = new BABYLON.CubeTexture(\"").concat(this.texture.name, "\", undefined, undefined, ").concat(this.texture.noMipmap, ", null, undefined, undefined, undefined, ").concat(this.texture._prefiltered, ", ").concat(forcedExtension ? '"' + forcedExtension + '"' : "null", ");\r\n");
        }
        else {
            codeString += "".concat(this._codeVariableName, ".texture = new BABYLON.Texture(\"").concat(this.texture.name, "\", null);\r\n");
        }
        codeString += "".concat(this._codeVariableName, ".texture.coordinatesMode = ").concat(this.texture.coordinatesMode, ";\r\n");
        return codeString;
    };
    ReflectionTextureBaseBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        if (this.texture && !this.texture.isRenderTarget) {
            serializationObject.texture = this.texture.serialize();
        }
        return serializationObject;
    };
    ReflectionTextureBaseBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        if (serializationObject.texture) {
            rootUrl = serializationObject.texture.url.indexOf("data:") === 0 ? "" : rootUrl;
            if (serializationObject.texture.isCube) {
                this.texture = CubeTexture.Parse(serializationObject.texture, scene, rootUrl);
            }
            else {
                this.texture = Texture.Parse(serializationObject.texture, scene, rootUrl);
            }
        }
    };
    return ReflectionTextureBaseBlock;
}(NodeMaterialBlock));
export { ReflectionTextureBaseBlock };
RegisterClass("BABYLON.ReflectionTextureBaseBlock", ReflectionTextureBaseBlock);
//# sourceMappingURL=reflectionTextureBaseBlock.js.map