import { __decorate, __extends } from "tslib";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { InputBlock } from "../Input/inputBlock.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../../nodeMaterialDecorator.js";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { CubeTexture } from "../../../Textures/cubeTexture.js";
import { Texture } from "../../../Textures/texture.js";
import { NodeMaterialSystemValues } from "../../Enums/nodeMaterialSystemValues.js";
import { Scalar } from "../../../../Maths/math.scalar.js";
/**
 * Block used to implement the refraction part of the sub surface module of the PBR material
 */
var RefractionBlock = /** @class */ (function (_super) {
    __extends(RefractionBlock, _super);
    /**
     * Create a new RefractionBlock
     * @param name defines the block name
     */
    function RefractionBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        /**
         * This parameters will make the material used its opacity to control how much it is refracting against not.
         * Materials half opaque for instance using refraction could benefit from this control.
         */
        _this.linkRefractionWithTransparency = false;
        /**
         * Controls if refraction needs to be inverted on Y. This could be useful for procedural texture.
         */
        _this.invertRefractionY = false;
        /**
         * Controls if refraction needs to be inverted on Y. This could be useful for procedural texture.
         */
        _this.useThicknessAsDepth = false;
        _this._isUnique = true;
        _this.registerInput("intensity", NodeMaterialBlockConnectionPointTypes.Float, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("tintAtDistance", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("volumeIndexOfRefraction", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("refraction", NodeMaterialBlockConnectionPointTypes.Object, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("refraction", _this, NodeMaterialConnectionPointDirection.Output, RefractionBlock, "RefractionBlock"));
        return _this;
    }
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    RefractionBlock.prototype.initialize = function (state) {
        state._excludeVariableName("vRefractionPosition");
        state._excludeVariableName("vRefractionSize");
    };
    /**
     * Gets the current class name
     * @returns the class name
     */
    RefractionBlock.prototype.getClassName = function () {
        return "RefractionBlock";
    };
    Object.defineProperty(RefractionBlock.prototype, "intensity", {
        /**
         * Gets the intensity input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RefractionBlock.prototype, "tintAtDistance", {
        /**
         * Gets the tint at distance input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RefractionBlock.prototype, "volumeIndexOfRefraction", {
        /**
         * Gets the volume index of refraction input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RefractionBlock.prototype, "view", {
        /**
         * Gets the view input component
         */
        get: function () {
            return this.viewConnectionPoint;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RefractionBlock.prototype, "refraction", {
        /**
         * Gets the refraction object output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RefractionBlock.prototype, "hasTexture", {
        /**
         * Returns true if the block has a texture
         */
        get: function () {
            return !!this._getTexture();
        },
        enumerable: false,
        configurable: true
    });
    RefractionBlock.prototype._getTexture = function () {
        if (this.texture) {
            return this.texture;
        }
        return this._scene.environmentTexture;
    };
    RefractionBlock.prototype.autoConfigure = function (material) {
        if (!this.intensity.isConnected) {
            var intensityInput = new InputBlock("Refraction intensity", NodeMaterialBlockTargets.Fragment, NodeMaterialBlockConnectionPointTypes.Float);
            intensityInput.value = 1;
            intensityInput.output.connectTo(this.intensity);
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
    RefractionBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        _super.prototype.prepareDefines.call(this, mesh, nodeMaterial, defines);
        var refractionTexture = this._getTexture();
        var refraction = refractionTexture && refractionTexture.getTextureMatrix;
        defines.setValue("SS_REFRACTION", refraction, true);
        if (!refraction) {
            return;
        }
        defines.setValue(this._define3DName, refractionTexture.isCube, true);
        defines.setValue(this._defineLODRefractionAlpha, refractionTexture.lodLevelInAlpha, true);
        defines.setValue(this._defineLinearSpecularRefraction, refractionTexture.linearSpecularLOD, true);
        defines.setValue(this._defineOppositeZ, this._scene.useRightHandedSystem ? !refractionTexture.invertZ : refractionTexture.invertZ, true);
        defines.setValue("SS_LINKREFRACTIONTOTRANSPARENCY", this.linkRefractionWithTransparency, true);
        defines.setValue("SS_GAMMAREFRACTION", refractionTexture.gammaSpace, true);
        defines.setValue("SS_RGBDREFRACTION", refractionTexture.isRGBD, true);
        defines.setValue("SS_USE_LOCAL_REFRACTIONMAP_CUBIC", refractionTexture.boundingBoxSize ? true : false, true);
        defines.setValue("SS_USE_THICKNESS_AS_DEPTH", this.useThicknessAsDepth, true);
    };
    RefractionBlock.prototype.isReady = function () {
        var texture = this._getTexture();
        if (texture && !texture.isReadyOrNotBlocking()) {
            return false;
        }
        return true;
    };
    RefractionBlock.prototype.bind = function (effect, nodeMaterial, mesh) {
        var _a, _b, _c, _d;
        _super.prototype.bind.call(this, effect, nodeMaterial, mesh);
        var refractionTexture = this._getTexture();
        if (!refractionTexture) {
            return;
        }
        if (refractionTexture.isCube) {
            effect.setTexture(this._cubeSamplerName, refractionTexture);
        }
        else {
            effect.setTexture(this._2DSamplerName, refractionTexture);
        }
        effect.setMatrix(this._refractionMatrixName, refractionTexture.getReflectionTextureMatrix());
        var depth = 1.0;
        if (!refractionTexture.isCube) {
            if (refractionTexture.depth) {
                depth = refractionTexture.depth;
            }
        }
        var indexOfRefraction = (_d = (_b = (_a = this.volumeIndexOfRefraction.connectInputBlock) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : (_c = this.indexOfRefractionConnectionPoint.connectInputBlock) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : 1.5;
        effect.setFloat4(this._vRefractionInfosName, refractionTexture.level, 1 / indexOfRefraction, depth, this.invertRefractionY ? -1 : 1);
        effect.setFloat4(this._vRefractionMicrosurfaceInfosName, refractionTexture.getSize().width, refractionTexture.lodGenerationScale, refractionTexture.lodGenerationOffset, 1 / indexOfRefraction);
        var width = refractionTexture.getSize().width;
        effect.setFloat2(this._vRefractionFilteringInfoName, width, Scalar.Log2(width));
        if (refractionTexture.boundingBoxSize) {
            var cubeTexture = refractionTexture;
            effect.setVector3("vRefractionPosition", cubeTexture.boundingBoxPosition);
            effect.setVector3("vRefractionSize", cubeTexture.boundingBoxSize);
        }
    };
    /**
     * Gets the main code of the block (fragment side)
     * @param state current state of the node material building
     * @returns the shader code
     */
    RefractionBlock.prototype.getCode = function (state) {
        var code = "";
        state.sharedData.blockingBlocks.push(this);
        state.sharedData.textureBlocks.push(this);
        // Samplers
        this._cubeSamplerName = state._getFreeVariableName(this.name + "CubeSampler");
        state.samplers.push(this._cubeSamplerName);
        this._2DSamplerName = state._getFreeVariableName(this.name + "2DSampler");
        state.samplers.push(this._2DSamplerName);
        this._define3DName = state._getFreeDefineName("SS_REFRACTIONMAP_3D");
        state._samplerDeclaration += "#ifdef ".concat(this._define3DName, "\r\n");
        state._samplerDeclaration += "uniform samplerCube ".concat(this._cubeSamplerName, ";\r\n");
        state._samplerDeclaration += "#else\r\n";
        state._samplerDeclaration += "uniform sampler2D ".concat(this._2DSamplerName, ";\r\n");
        state._samplerDeclaration += "#endif\r\n";
        // Fragment
        state.sharedData.blocksWithDefines.push(this);
        state.sharedData.bindableBlocks.push(this);
        this._defineLODRefractionAlpha = state._getFreeDefineName("SS_LODINREFRACTIONALPHA");
        this._defineLinearSpecularRefraction = state._getFreeDefineName("SS_LINEARSPECULARREFRACTION");
        this._defineOppositeZ = state._getFreeDefineName("SS_REFRACTIONMAP_OPPOSITEZ");
        this._refractionMatrixName = state._getFreeVariableName("refractionMatrix");
        state._emitUniformFromString(this._refractionMatrixName, "mat4");
        state._emitFunction("sampleRefraction", "\n            #ifdef ".concat(this._define3DName, "\n                #define sampleRefraction(s, c) textureCube(s, c)\n            #else\n                #define sampleRefraction(s, c) texture2D(s, c)\n            #endif\r\n"), "//".concat(this.name));
        state._emitFunction("sampleRefractionLod", "\n            #ifdef ".concat(this._define3DName, "\n                #define sampleRefractionLod(s, c, l) textureCubeLodEXT(s, c, l)\n            #else\n                #define sampleRefractionLod(s, c, l) texture2DLodEXT(s, c, l)\n            #endif\r\n"), "//".concat(this.name));
        this._vRefractionMicrosurfaceInfosName = state._getFreeVariableName("vRefractionMicrosurfaceInfos");
        state._emitUniformFromString(this._vRefractionMicrosurfaceInfosName, "vec4");
        this._vRefractionInfosName = state._getFreeVariableName("vRefractionInfos");
        state._emitUniformFromString(this._vRefractionInfosName, "vec4");
        this._vRefractionFilteringInfoName = state._getFreeVariableName("vRefractionFilteringInfo");
        state._emitUniformFromString(this._vRefractionFilteringInfoName, "vec2");
        state._emitUniformFromString("vRefractionPosition", "vec3");
        state._emitUniformFromString("vRefractionSize", "vec3");
        return code;
    };
    RefractionBlock.prototype._buildBlock = function (state) {
        this._scene = state.sharedData.scene;
        return this;
    };
    RefractionBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        if (this.texture) {
            if (this.texture.isCube) {
                codeString = "".concat(this._codeVariableName, ".texture = new BABYLON.CubeTexture(\"").concat(this.texture.name, "\");\r\n");
            }
            else {
                codeString = "".concat(this._codeVariableName, ".texture = new BABYLON.Texture(\"").concat(this.texture.name, "\");\r\n");
            }
            codeString += "".concat(this._codeVariableName, ".texture.coordinatesMode = ").concat(this.texture.coordinatesMode, ";\r\n");
        }
        codeString += "".concat(this._codeVariableName, ".linkRefractionWithTransparency = ").concat(this.linkRefractionWithTransparency, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".invertRefractionY = ").concat(this.invertRefractionY, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".useThicknessAsDepth = ").concat(this.useThicknessAsDepth, ";\r\n");
        return codeString;
    };
    RefractionBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        if (this.texture && !this.texture.isRenderTarget) {
            serializationObject.texture = this.texture.serialize();
        }
        serializationObject.linkRefractionWithTransparency = this.linkRefractionWithTransparency;
        serializationObject.invertRefractionY = this.invertRefractionY;
        serializationObject.useThicknessAsDepth = this.useThicknessAsDepth;
        return serializationObject;
    };
    RefractionBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
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
        this.linkRefractionWithTransparency = serializationObject.linkRefractionWithTransparency;
        this.invertRefractionY = serializationObject.invertRefractionY;
        this.useThicknessAsDepth = !!serializationObject.useThicknessAsDepth;
    };
    __decorate([
        editableInPropertyPage("Link refraction to transparency", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], RefractionBlock.prototype, "linkRefractionWithTransparency", void 0);
    __decorate([
        editableInPropertyPage("Invert refraction Y", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], RefractionBlock.prototype, "invertRefractionY", void 0);
    __decorate([
        editableInPropertyPage("Use thickness as depth", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { update: true } })
    ], RefractionBlock.prototype, "useThicknessAsDepth", void 0);
    return RefractionBlock;
}(NodeMaterialBlock));
export { RefractionBlock };
RegisterClass("BABYLON.RefractionBlock", RefractionBlock);
//# sourceMappingURL=refractionBlock.js.map