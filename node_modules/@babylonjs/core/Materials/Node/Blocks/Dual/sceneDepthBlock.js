import { __decorate, __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../../nodeMaterialDecorator.js";
/**
 * Block used to retrieve the depth (zbuffer) of the scene
 * @since 5.0.0
 */
var SceneDepthBlock = /** @class */ (function (_super) {
    __extends(SceneDepthBlock, _super);
    /**
     * Create a new SceneDepthBlock
     * @param name defines the block name
     */
    function SceneDepthBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.VertexAndFragment) || this;
        _this._samplerName = "textureSampler";
        /**
         * Defines if the depth renderer should be setup in non linear mode
         */
        _this.useNonLinearDepth = false;
        /**
         * Defines if the depth renderer should be setup in full 32 bits float mode
         */
        _this.force32itsFloat = false;
        _this._isUnique = true;
        _this.registerInput("uv", NodeMaterialBlockConnectionPointTypes.Vector2, false, NodeMaterialBlockTargets.VertexAndFragment);
        _this.registerOutput("depth", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Neutral);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        _this._inputs[0]._prioritizeVertex = false;
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    SceneDepthBlock.prototype.getClassName = function () {
        return "SceneDepthBlock";
    };
    Object.defineProperty(SceneDepthBlock.prototype, "uv", {
        /**
         * Gets the uv input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneDepthBlock.prototype, "depth", {
        /**
         * Gets the depth output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    SceneDepthBlock.prototype.initialize = function (state) {
        state._excludeVariableName("textureSampler");
    };
    Object.defineProperty(SceneDepthBlock.prototype, "target", {
        get: function () {
            if (!this.uv.isConnected) {
                return NodeMaterialBlockTargets.VertexAndFragment;
            }
            if (this.uv.sourceBlock.isInput) {
                return NodeMaterialBlockTargets.VertexAndFragment;
            }
            return NodeMaterialBlockTargets.Fragment;
        },
        enumerable: false,
        configurable: true
    });
    SceneDepthBlock.prototype._getTexture = function (scene) {
        var depthRenderer = scene.enableDepthRenderer(undefined, this.useNonLinearDepth, this.force32itsFloat);
        return depthRenderer.getDepthMap();
    };
    SceneDepthBlock.prototype.bind = function (effect, nodeMaterial) {
        var texture = this._getTexture(nodeMaterial.getScene());
        effect.setTexture(this._samplerName, texture);
    };
    SceneDepthBlock.prototype._injectVertexCode = function (state) {
        var uvInput = this.uv;
        if (uvInput.connectedPoint.ownerBlock.isInput) {
            var uvInputOwnerBlock = uvInput.connectedPoint.ownerBlock;
            if (!uvInputOwnerBlock.isAttribute) {
                state._emitUniformFromString(uvInput.associatedVariableName, "vec" + (uvInput.type === NodeMaterialBlockConnectionPointTypes.Vector3 ? "3" : uvInput.type === NodeMaterialBlockConnectionPointTypes.Vector4 ? "4" : "2"));
            }
        }
        this._mainUVName = "vMain" + uvInput.associatedVariableName;
        state._emitVaryingFromString(this._mainUVName, "vec2");
        state.compilationString += "".concat(this._mainUVName, " = ").concat(uvInput.associatedVariableName, ".xy;\r\n");
        if (!this._outputs.some(function (o) { return o.isConnectedInVertexShader; })) {
            return;
        }
        this._writeTextureRead(state, true);
        for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.hasEndpoints) {
                this._writeOutput(state, output, "r", true);
            }
        }
    };
    SceneDepthBlock.prototype._writeTextureRead = function (state, vertexMode) {
        if (vertexMode === void 0) { vertexMode = false; }
        var uvInput = this.uv;
        if (vertexMode) {
            if (state.target === NodeMaterialBlockTargets.Fragment) {
                return;
            }
            state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(this._samplerName, ", ").concat(uvInput.associatedVariableName, ".xy);\r\n");
            return;
        }
        if (this.uv.ownerBlock.target === NodeMaterialBlockTargets.Fragment) {
            state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(this._samplerName, ", ").concat(uvInput.associatedVariableName, ".xy);\r\n");
            return;
        }
        state.compilationString += "vec4 ".concat(this._tempTextureRead, " = texture2D(").concat(this._samplerName, ", ").concat(this._mainUVName, ");\r\n");
    };
    SceneDepthBlock.prototype._writeOutput = function (state, output, swizzle, vertexMode) {
        if (vertexMode === void 0) { vertexMode = false; }
        if (vertexMode) {
            if (state.target === NodeMaterialBlockTargets.Fragment) {
                return;
            }
            state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle, ";\r\n");
            return;
        }
        if (this.uv.ownerBlock.target === NodeMaterialBlockTargets.Fragment) {
            state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle, ";\r\n");
            return;
        }
        state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(this._tempTextureRead, ".").concat(swizzle, ";\r\n");
    };
    SceneDepthBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        this._tempTextureRead = state._getFreeVariableName("tempTextureRead");
        if (state.sharedData.bindableBlocks.indexOf(this) < 0) {
            state.sharedData.bindableBlocks.push(this);
        }
        if (state.target !== NodeMaterialBlockTargets.Fragment) {
            // Vertex
            state._emit2DSampler(this._samplerName);
            this._injectVertexCode(state);
            return;
        }
        // Fragment
        if (!this._outputs.some(function (o) { return o.isConnectedInFragmentShader; })) {
            return;
        }
        state._emit2DSampler(this._samplerName);
        this._writeTextureRead(state);
        for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.hasEndpoints) {
                this._writeOutput(state, output, "r");
            }
        }
        return this;
    };
    SceneDepthBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.useNonLinearDepth = this.useNonLinearDepth;
        serializationObject.force32itsFloat = this.force32itsFloat;
        return serializationObject;
    };
    SceneDepthBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.useNonLinearDepth = serializationObject.useNonLinearDepth;
        this.force32itsFloat = serializationObject.force32itsFloat;
    };
    __decorate([
        editableInPropertyPage("Use non linear depth", PropertyTypeForEdition.Boolean, "ADVANCED", {
            notifiers: { activatePreviewCommand: true, callback: function (scene) { return scene.disableDepthRenderer(); } },
        })
    ], SceneDepthBlock.prototype, "useNonLinearDepth", void 0);
    __decorate([
        editableInPropertyPage("Force 32 bits float", PropertyTypeForEdition.Boolean, "ADVANCED", {
            notifiers: { activatePreviewCommand: true, callback: function (scene) { return scene.disableDepthRenderer(); } },
        })
    ], SceneDepthBlock.prototype, "force32itsFloat", void 0);
    return SceneDepthBlock;
}(NodeMaterialBlock));
export { SceneDepthBlock };
RegisterClass("BABYLON.SceneDepthBlock", SceneDepthBlock);
//# sourceMappingURL=sceneDepthBlock.js.map