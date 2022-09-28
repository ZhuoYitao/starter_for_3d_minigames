import { __decorate, __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../../nodeMaterialDecorator.js";
import { MaterialHelper } from "../../../materialHelper.js";
/**
 * Block used to output the final color
 */
var FragmentOutputBlock = /** @class */ (function (_super) {
    __extends(FragmentOutputBlock, _super);
    /**
     * Create a new FragmentOutputBlock
     * @param name defines the block name
     */
    function FragmentOutputBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment, true) || this;
        /** Gets or sets a boolean indicating if content needs to be converted to gamma space */
        _this.convertToGammaSpace = false;
        /** Gets or sets a boolean indicating if content needs to be converted to linear space */
        _this.convertToLinearSpace = false;
        /** Gets or sets a boolean indicating if logarithmic depth should be used */
        _this.useLogarithmicDepth = false;
        _this.registerInput("rgba", NodeMaterialBlockConnectionPointTypes.Color4, true);
        _this.registerInput("rgb", NodeMaterialBlockConnectionPointTypes.Color3, true);
        _this.registerInput("a", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.rgb.acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Float);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    FragmentOutputBlock.prototype.getClassName = function () {
        return "FragmentOutputBlock";
    };
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    FragmentOutputBlock.prototype.initialize = function (state) {
        state._excludeVariableName("logarithmicDepthConstant");
        state._excludeVariableName("vFragmentDepth");
    };
    Object.defineProperty(FragmentOutputBlock.prototype, "rgba", {
        /**
         * Gets the rgba input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FragmentOutputBlock.prototype, "rgb", {
        /**
         * Gets the rgb input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FragmentOutputBlock.prototype, "a", {
        /**
         * Gets the a input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    FragmentOutputBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        defines.setValue(this._linearDefineName, this.convertToLinearSpace, true);
        defines.setValue(this._gammaDefineName, this.convertToGammaSpace, true);
    };
    FragmentOutputBlock.prototype.bind = function (effect, nodeMaterial, mesh) {
        if (this.useLogarithmicDepth && mesh) {
            MaterialHelper.BindLogDepth(undefined, effect, mesh.getScene());
        }
    };
    FragmentOutputBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var rgba = this.rgba;
        var rgb = this.rgb;
        var a = this.a;
        state.sharedData.hints.needAlphaBlending = rgba.isConnected || a.isConnected;
        state.sharedData.blocksWithDefines.push(this);
        if (this.useLogarithmicDepth) {
            state._emitUniformFromString("logarithmicDepthConstant", "float");
            state._emitVaryingFromString("vFragmentDepth", "float");
            state.sharedData.bindableBlocks.push(this);
        }
        this._linearDefineName = state._getFreeDefineName("CONVERTTOLINEAR");
        this._gammaDefineName = state._getFreeDefineName("CONVERTTOGAMMA");
        var comments = "//".concat(this.name);
        state._emitFunctionFromInclude("helperFunctions", comments);
        if (rgba.connectedPoint) {
            if (a.isConnected) {
                state.compilationString += "gl_FragColor = vec4(".concat(rgba.associatedVariableName, ".rgb, ").concat(a.associatedVariableName, ");\r\n");
            }
            else {
                state.compilationString += "gl_FragColor = ".concat(rgba.associatedVariableName, ";\r\n");
            }
        }
        else if (rgb.connectedPoint) {
            var aValue = "1.0";
            if (a.connectedPoint) {
                aValue = a.associatedVariableName;
            }
            if (rgb.connectedPoint.type === NodeMaterialBlockConnectionPointTypes.Float) {
                state.compilationString += "gl_FragColor = vec4(".concat(rgb.associatedVariableName, ", ").concat(rgb.associatedVariableName, ", ").concat(rgb.associatedVariableName, ", ").concat(aValue, ");\r\n");
            }
            else {
                state.compilationString += "gl_FragColor = vec4(".concat(rgb.associatedVariableName, ", ").concat(aValue, ");\r\n");
            }
        }
        else {
            state.sharedData.checks.notConnectedNonOptionalInputs.push(rgba);
        }
        state.compilationString += "#ifdef ".concat(this._linearDefineName, "\r\n");
        state.compilationString += "gl_FragColor = toLinearSpace(gl_FragColor);\r\n";
        state.compilationString += "#endif\r\n";
        state.compilationString += "#ifdef ".concat(this._gammaDefineName, "\r\n");
        state.compilationString += "gl_FragColor = toGammaSpace(gl_FragColor);\r\n";
        state.compilationString += "#endif\r\n";
        if (this.useLogarithmicDepth) {
            state.compilationString += "gl_FragDepthEXT = log2(vFragmentDepth) * logarithmicDepthConstant * 0.5;\r\n";
        }
        return this;
    };
    FragmentOutputBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".convertToGammaSpace = ").concat(this.convertToGammaSpace, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".convertToLinearSpace = ").concat(this.convertToLinearSpace, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".useLogarithmicDepth = ").concat(this.useLogarithmicDepth, ";\r\n");
        return codeString;
    };
    FragmentOutputBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.convertToGammaSpace = this.convertToGammaSpace;
        serializationObject.convertToLinearSpace = this.convertToLinearSpace;
        serializationObject.useLogarithmicDepth = this.useLogarithmicDepth;
        return serializationObject;
    };
    FragmentOutputBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        var _a;
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.convertToGammaSpace = serializationObject.convertToGammaSpace;
        this.convertToLinearSpace = serializationObject.convertToLinearSpace;
        this.useLogarithmicDepth = (_a = serializationObject.useLogarithmicDepth) !== null && _a !== void 0 ? _a : false;
    };
    __decorate([
        editableInPropertyPage("Convert to gamma space", PropertyTypeForEdition.Boolean, "PROPERTIES", { notifiers: { update: true } })
    ], FragmentOutputBlock.prototype, "convertToGammaSpace", void 0);
    __decorate([
        editableInPropertyPage("Convert to linear space", PropertyTypeForEdition.Boolean, "PROPERTIES", { notifiers: { update: true } })
    ], FragmentOutputBlock.prototype, "convertToLinearSpace", void 0);
    __decorate([
        editableInPropertyPage("Use logarithmic depth", PropertyTypeForEdition.Boolean, "PROPERTIES")
    ], FragmentOutputBlock.prototype, "useLogarithmicDepth", void 0);
    return FragmentOutputBlock;
}(NodeMaterialBlock));
export { FragmentOutputBlock };
RegisterClass("BABYLON.FragmentOutputBlock", FragmentOutputBlock);
//# sourceMappingURL=fragmentOutputBlock.js.map