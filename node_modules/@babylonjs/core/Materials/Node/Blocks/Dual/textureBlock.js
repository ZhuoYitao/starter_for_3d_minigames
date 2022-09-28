import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { NodeMaterial } from "../../nodeMaterial.js";
import { InputBlock } from "../Input/inputBlock.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { Texture } from "../../../Textures/texture.js";
import { NodeMaterialModes } from "../../Enums/nodeMaterialModes.js";

import "../../../../Shaders/ShadersInclude/helperFunctions.js";
import { ImageSourceBlock } from "./imageSourceBlock.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { EngineStore } from "../../../../Engines/engineStore.js";
/**
 * Block used to read a texture from a sampler
 */
var TextureBlock = /** @class */ (function (_super) {
    __extends(TextureBlock, _super);
    /**
     * Create a new TextureBlock
     * @param name defines the block name
     * @param fragmentOnly
     */
    function TextureBlock(name, fragmentOnly) {
        if (fragmentOnly === void 0) { fragmentOnly = false; }
        var _this = _super.call(this, name, fragmentOnly ? NodeMaterialBlockTargets.Fragment : NodeMaterialBlockTargets.VertexAndFragment) || this;
        _this._convertToGammaSpace = false;
        _this._convertToLinearSpace = false;
        /**
         * Gets or sets a boolean indicating if multiplication of texture with level should be disabled
         */
        _this.disableLevelMultiplication = false;
        _this._fragmentOnly = fragmentOnly;
        _this.registerInput("uv", NodeMaterialBlockConnectionPointTypes.Vector2, false, NodeMaterialBlockTargets.VertexAndFragment);
        _this.registerInput("source", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.VertexAndFragment, new NodeMaterialConnectionPointCustomObject("source", _this, NodeMaterialConnectionPointDirection.Input, ImageSourceBlock, "ImageSourceBlock"));
        _this.registerOutput("rgba", NodeMaterialBlockConnectionPointTypes.Color4, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("rgb", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("r", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("g", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("b", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("a", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this.registerOutput("level", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        _this._inputs[0]._prioritizeVertex = !fragmentOnly;
        return _this;
    }
    Object.defineProperty(TextureBlock.prototype, "texture", {
        /**
         * Gets or sets the texture associated with the node
         */
        get: function () {
            var _a;
            if (this.source.isConnected) {
                return ((_a = this.source.connectedPoint) === null || _a === void 0 ? void 0 : _a.ownerBlock).texture;
            }
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
    Object.defineProperty(TextureBlock.prototype, "samplerName", {
        /**
         * Gets the sampler name associated with this texture
         */
        get: function () {
            if (this._imageSource) {
                return this._imageSource.samplerName;
            }
            return this._samplerName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "hasImageSource", {
        /**
         * Gets a boolean indicating that this block is linked to an ImageSourceBlock
         */
        get: function () {
            return !!this._imageSource;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "convertToGammaSpace", {
        get: function () {
            return this._convertToGammaSpace;
        },
        /**
         * Gets or sets a boolean indicating if content needs to be converted to gamma space
         */
        set: function (value) {
            var _this = this;
            var _a;
            if (value === this._convertToGammaSpace) {
                return;
            }
            this._convertToGammaSpace = value;
            if (this.texture) {
                var scene = (_a = this.texture.getScene()) !== null && _a !== void 0 ? _a : EngineStore.LastCreatedScene;
                scene === null || scene === void 0 ? void 0 : scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(_this.texture);
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "convertToLinearSpace", {
        get: function () {
            return this._convertToLinearSpace;
        },
        /**
         * Gets or sets a boolean indicating if content needs to be converted to linear space
         */
        set: function (value) {
            var _this = this;
            var _a;
            if (value === this._convertToLinearSpace) {
                return;
            }
            this._convertToLinearSpace = value;
            if (this.texture) {
                var scene = (_a = this.texture.getScene()) !== null && _a !== void 0 ? _a : EngineStore.LastCreatedScene;
                scene === null || scene === void 0 ? void 0 : scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(_this.texture);
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
    TextureBlock.prototype.getClassName = function () {
        return "TextureBlock";
    };
    Object.defineProperty(TextureBlock.prototype, "uv", {
        /**
         * Gets the uv input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "source", {
        /**
         * Gets the source input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "rgba", {
        /**
         * Gets the rgba output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "rgb", {
        /**
         * Gets the rgb output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "r", {
        /**
         * Gets the r output component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "g", {
        /**
         * Gets the g output component
         */
        get: function () {
            return this._outputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "b", {
        /**
         * Gets the b output component
         */
        get: function () {
            return this._outputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "a", {
        /**
         * Gets the a output component
         */
        get: function () {
            return this._outputs[5];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "level", {
        /**
         * Gets the level output component
         */
        get: function () {
            return this._outputs[6];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureBlock.prototype, "target", {
        get: function () {
            if (this._fragmentOnly) {
                return NodeMaterialBlockTargets.Fragment;
            }
            // TextureBlock has a special optimizations for uvs that come from the vertex shaders as they can be packed into a single varyings.
            // But we need to detect uvs coming from fragment then
            if (!this.uv.isConnected) {
                return NodeMaterialBlockTargets.VertexAndFragment;
            }
            if (this.uv.sourceBlock.isInput) {
                return NodeMaterialBlockTargets.VertexAndFragment;
            }
            var parent = this.uv.connectedPoint;
            while (parent) {
                if (parent.target === NodeMaterialBlockTargets.Fragment) {
                    return NodeMaterialBlockTargets.Fragment;
                }
                if (parent.target === NodeMaterialBlockTargets.Vertex) {
                    return NodeMaterialBlockTargets.VertexAndFragment;
                }
                if (parent.target === NodeMaterialBlockTargets.Neutral || parent.target === NodeMaterialBlockTargets.VertexAndFragment) {
                    var parentBlock = parent.ownerBlock;
                    if (parentBlock.target === NodeMaterialBlockTargets.Fragment) {
                        return NodeMaterialBlockTargets.Fragment;
                    }
                    parent = null;
                    for (var _i = 0, _a = parentBlock.inputs; _i < _a.length; _i++) {
                        var input = _a[_i];
                        if (input.connectedPoint) {
                            parent = input.connectedPoint;
                            break;
                        }
                    }
                }
            }
            return NodeMaterialBlockTargets.VertexAndFragment;
        },
        set: function (value) { },
        enumerable: false,
        configurable: true
    });
    TextureBlock.prototype.autoConfigure = function (material) {
        if (!this.uv.isConnected) {
            if (material.mode === NodeMaterialModes.PostProcess) {
                var uvInput = material.getBlockByPredicate(function (b) { return b.name === "uv"; });
                if (uvInput) {
                    uvInput.connectTo(this);
                }
            }
            else {
                var attributeName_1 = material.mode === NodeMaterialModes.Particle ? "particle_uv" : "uv";
                var uvInput = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === attributeName_1; });
                if (!uvInput) {
                    uvInput = new InputBlock("uv");
                    uvInput.setAsAttribute(attributeName_1);
                }
                uvInput.output.connectTo(this.uv);
            }
        }
    };
    TextureBlock.prototype.initializeDefines = function (mesh, nodeMaterial, defines) {
        if (!defines._areTexturesDirty) {
            return;
        }
        if (this._mainUVDefineName !== undefined) {
            defines.setValue(this._mainUVDefineName, false, true);
        }
    };
    TextureBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        if (!defines._areTexturesDirty) {
            return;
        }
        if (!this.texture || !this.texture.getTextureMatrix) {
            if (this._isMixed) {
                defines.setValue(this._defineName, false, true);
                defines.setValue(this._mainUVDefineName, true, true);
            }
            return;
        }
        var toGamma = this.convertToGammaSpace && this.texture && !this.texture.gammaSpace;
        var toLinear = this.convertToLinearSpace && this.texture && this.texture.gammaSpace;
        // Not a bug... Name defines the texture space not the required conversion
        defines.setValue(this._linearDefineName, toGamma, true);
        defines.setValue(this._gammaDefineName, toLinear, true);
        if (this._isMixed) {
            if (!this.texture.getTextureMatrix().isIdentityAs3x2()) {
                defines.setValue(this._defineName, true);
                if (defines[this._mainUVDefineName] == undefined) {
                    defines.setValue(this._mainUVDefineName, false, true);
                }
            }
            else {
                defines.setValue(this._defineName, false, true);
                defines.setValue(this._mainUVDefineName, true, true);
            }
        }
    };
    TextureBlock.prototype.isReady = function () {
        if (this.texture && !this.texture.isReadyOrNotBlocking()) {
            return false;
        }
        return true;
    };
    TextureBlock.prototype.bind = function (effect) {
        if (!this.texture) {
            return;
        }
        if (this._isMixed) {
            effect.setFloat(this._textureInfoName, this.texture.level);
            effect.setMatrix(this._textureTransformName, this.texture.getTextureMatrix());
        }
        if (!this._imageSource) {
            effect.setTexture(this._samplerName, this.texture);
        }
    };
    Object.defineProperty(TextureBlock.prototype, "_isMixed", {
        get: function () {
            return this.target !== NodeMaterialBlockTargets.Fragment;
        },
        enumerable: false,
        configurable: true
    });
    TextureBlock.prototype._injectVertexCode = function (state) {
        var uvInput = this.uv;
        // Inject code in vertex
        this._defineName = state._getFreeDefineName("UVTRANSFORM");
        this._mainUVDefineName = "VMAIN" + uvInput.associatedVariableName.toUpperCase();
        this._mainUVName = "vMain" + uvInput.associatedVariableName;
        this._transformedUVName = state._getFreeVariableName("transformedUV");
        this._textureTransformName = state._getFreeVariableName("textureTransform");
        this._textureInfoName = state._getFreeVariableName("textureInfoName");
        this.level.associatedVariableName = this._textureInfoName;
        state._emitVaryingFromString(this._transformedUVName, "vec2", this._defineName);
        state._emitVaryingFromString(this._mainUVName, "vec2", this._mainUVDefineName);
        state._emitUniformFromString(this._textureTransformName, "mat4", this._defineName);
        state.compilationString += "#ifdef ".concat(this._defineName, "\r\n");
        state.compilationString += "".concat(this._transformedUVName, " = vec2(").concat(this._textureTransformName, " * vec4(").concat(uvInput.associatedVariableName, ".xy, 1.0, 0.0));\r\n");
        state.compilationString += "#elif defined(".concat(this._mainUVDefineName, ")\r\n");
        state.compilationString += "".concat(this._mainUVName, " = ").concat(uvInput.associatedVariableName, ".xy;\r\n");
        state.compilationString += "#endif\r\n";
        if (!this._outputs.some(function (o) { return o.isConnectedInVertexShader; })) {
            return;
        }
        this._writeTextureRead(state, true);
        for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.hasEndpoints && output.name !== "level") {
                this._writeOutput(state, output, output.name, true);
            }
        }
    };
    TextureBlock.prototype._generateTextureLookup = function (state) {
        var samplerName = this.samplerName;
        state.compilationString += "#ifdef ".concat(this._defineName, "\r\n");
        state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(samplerName, ", ").concat(this._transformedUVName, ");\r\n");
        state.compilationString += "#elif defined(".concat(this._mainUVDefineName, ")\r\n");
        state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(samplerName, ", ").concat(this._mainUVName ? this._mainUVName : this.uv.associatedVariableName, ");\r\n");
        state.compilationString += "#endif\r\n";
    };
    TextureBlock.prototype._writeTextureRead = function (state, vertexMode) {
        if (vertexMode === void 0) { vertexMode = false; }
        var uvInput = this.uv;
        if (vertexMode) {
            if (state.target === NodeMaterialBlockTargets.Fragment) {
                return;
            }
            this._generateTextureLookup(state);
            return;
        }
        if (this.uv.ownerBlock.target === NodeMaterialBlockTargets.Fragment) {
            state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(this.samplerName, ", ").concat(uvInput.associatedVariableName, ");\r\n");
            return;
        }
        this._generateTextureLookup(state);
    };
    TextureBlock.prototype._generateConversionCode = function (state, output, swizzle) {
        if (swizzle !== "a") {
            // no conversion if the output is "a" (alpha)
            if (!this.texture || !this.texture.gammaSpace) {
                state.compilationString += "#ifdef ".concat(this._linearDefineName, "\n                    ").concat(output.associatedVariableName, " = toGammaSpace(").concat(output.associatedVariableName, ");\n                    #endif\n                ");
            }
            state.compilationString += "#ifdef ".concat(this._gammaDefineName, "\n                ").concat(output.associatedVariableName, " = toLinearSpace(").concat(output.associatedVariableName, ");\n                #endif\n            ");
        }
    };
    TextureBlock.prototype._writeOutput = function (state, output, swizzle, vertexMode) {
        if (vertexMode === void 0) { vertexMode = false; }
        if (vertexMode) {
            if (state.target === NodeMaterialBlockTargets.Fragment) {
                return;
            }
            state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle, ";\r\n");
            this._generateConversionCode(state, output, swizzle);
            return;
        }
        if (this.uv.ownerBlock.target === NodeMaterialBlockTargets.Fragment) {
            state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle, ";\r\n");
            this._generateConversionCode(state, output, swizzle);
            return;
        }
        var complement = "";
        if (!this.disableLevelMultiplication) {
            complement = " * ".concat(this._textureInfoName);
        }
        state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle).concat(complement, ";\r\n");
        this._generateConversionCode(state, output, swizzle);
    };
    TextureBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (this.source.isConnected) {
            this._imageSource = this.source.connectedPoint.ownerBlock;
        }
        else {
            this._imageSource = null;
        }
        if (state.target === NodeMaterialBlockTargets.Vertex || this._fragmentOnly || (state.target === NodeMaterialBlockTargets.Fragment && this._tempTextureRead === undefined)) {
            this._tempTextureRead = state._getFreeVariableName("tempTextureRead");
            this._linearDefineName = state._getFreeDefineName("ISLINEAR");
            this._gammaDefineName = state._getFreeDefineName("ISGAMMA");
        }
        if ((!this._isMixed && state.target === NodeMaterialBlockTargets.Fragment) || (this._isMixed && state.target === NodeMaterialBlockTargets.Vertex)) {
            if (!this._imageSource) {
                this._samplerName = state._getFreeVariableName(this.name + "Sampler");
                state._emit2DSampler(this._samplerName);
            }
            // Declarations
            state.sharedData.blockingBlocks.push(this);
            state.sharedData.textureBlocks.push(this);
            state.sharedData.blocksWithDefines.push(this);
            state.sharedData.bindableBlocks.push(this);
        }
        if (state.target !== NodeMaterialBlockTargets.Fragment) {
            // Vertex
            this._injectVertexCode(state);
            return;
        }
        // Fragment
        if (!this._outputs.some(function (o) { return o.isConnectedInFragmentShader; })) {
            return;
        }
        if (this._isMixed && !this._imageSource) {
            // Reexport the sampler
            state._emit2DSampler(this._samplerName);
        }
        var comments = "//".concat(this.name);
        state._emitFunctionFromInclude("helperFunctions", comments);
        if (this._isMixed) {
            state._emitUniformFromString(this._textureInfoName, "float");
        }
        this._writeTextureRead(state);
        for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.hasEndpoints && output.name !== "level") {
                this._writeOutput(state, output, output.name);
            }
        }
        return this;
    };
    TextureBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".convertToGammaSpace = ").concat(this.convertToGammaSpace, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".convertToLinearSpace = ").concat(this.convertToLinearSpace, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".disableLevelMultiplication = ").concat(this.disableLevelMultiplication, ";\r\n");
        if (!this.texture) {
            return codeString;
        }
        codeString += "".concat(this._codeVariableName, ".texture = new BABYLON.Texture(\"").concat(this.texture.name, "\", null, ").concat(this.texture.noMipmap, ", ").concat(this.texture.invertY, ", ").concat(this.texture.samplingMode, ");\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.wrapU = ").concat(this.texture.wrapU, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.wrapV = ").concat(this.texture.wrapV, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.uAng = ").concat(this.texture.uAng, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.vAng = ").concat(this.texture.vAng, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.wAng = ").concat(this.texture.wAng, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.uOffset = ").concat(this.texture.uOffset, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.vOffset = ").concat(this.texture.vOffset, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.uScale = ").concat(this.texture.uScale, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.vScale = ").concat(this.texture.vScale, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.coordinatesMode = ").concat(this.texture.coordinatesMode, ";\r\n");
        return codeString;
    };
    TextureBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.convertToGammaSpace = this.convertToGammaSpace;
        serializationObject.convertToLinearSpace = this.convertToLinearSpace;
        serializationObject.fragmentOnly = this._fragmentOnly;
        serializationObject.disableLevelMultiplication = this.disableLevelMultiplication;
        if (!this.hasImageSource && this.texture && !this.texture.isRenderTarget && this.texture.getClassName() !== "VideoTexture") {
            serializationObject.texture = this.texture.serialize();
        }
        return serializationObject;
    };
    TextureBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.convertToGammaSpace = serializationObject.convertToGammaSpace;
        this.convertToLinearSpace = !!serializationObject.convertToLinearSpace;
        this._fragmentOnly = !!serializationObject.fragmentOnly;
        this.disableLevelMultiplication = !!serializationObject.disableLevelMultiplication;
        if (serializationObject.texture && !NodeMaterial.IgnoreTexturesAtLoadTime && serializationObject.texture.url !== undefined) {
            rootUrl = serializationObject.texture.url.indexOf("data:") === 0 ? "" : rootUrl;
            this.texture = Texture.Parse(serializationObject.texture, scene, rootUrl);
        }
    };
    return TextureBlock;
}(NodeMaterialBlock));
export { TextureBlock };
RegisterClass("BABYLON.TextureBlock", TextureBlock);
//# sourceMappingURL=textureBlock.js.map