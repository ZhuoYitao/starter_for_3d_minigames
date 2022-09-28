import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to create a Color3/4 out of individual inputs (one for each component)
 */
var ColorMergerBlock = /** @class */ (function (_super) {
    __extends(ColorMergerBlock, _super);
    /**
     * Create a new ColorMergerBlock
     * @param name defines the block name
     */
    function ColorMergerBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        /**
         * Gets or sets the swizzle for r (meaning which component to affect to the output.r)
         */
        _this.rSwizzle = "r";
        /**
         * Gets or sets the swizzle for g (meaning which component to affect to the output.g)
         */
        _this.gSwizzle = "g";
        /**
         * Gets or sets the swizzle for b (meaning which component to affect to the output.b)
         */
        _this.bSwizzle = "b";
        /**
         * Gets or sets the swizzle for a (meaning which component to affect to the output.a)
         */
        _this.aSwizzle = "a";
        _this.registerInput("rgb ", NodeMaterialBlockConnectionPointTypes.Color3, true);
        _this.registerInput("r", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("g", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("b", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("a", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerOutput("rgba", NodeMaterialBlockConnectionPointTypes.Color4);
        _this.registerOutput("rgb", NodeMaterialBlockConnectionPointTypes.Color3);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ColorMergerBlock.prototype.getClassName = function () {
        return "ColorMergerBlock";
    };
    Object.defineProperty(ColorMergerBlock.prototype, "rgbIn", {
        /**
         * Gets the rgb component (input)
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColorMergerBlock.prototype, "r", {
        /**
         * Gets the r component (input)
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColorMergerBlock.prototype, "g", {
        /**
         * Gets the g component (input)
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColorMergerBlock.prototype, "b", {
        /**
         * Gets the b component (input)
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColorMergerBlock.prototype, "a", {
        /**
         * Gets the a component (input)
         */
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColorMergerBlock.prototype, "rgba", {
        /**
         * Gets the rgba component (output)
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColorMergerBlock.prototype, "rgbOut", {
        /**
         * Gets the rgb component (output)
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColorMergerBlock.prototype, "rgb", {
        /**
         * Gets the rgb component (output)
         * @deprecated Please use rgbOut instead.
         */
        get: function () {
            return this.rgbOut;
        },
        enumerable: false,
        configurable: true
    });
    ColorMergerBlock.prototype._inputRename = function (name) {
        if (name === "rgb ") {
            return "rgbIn";
        }
        return name;
    };
    ColorMergerBlock.prototype._buildSwizzle = function (len) {
        var swizzle = this.rSwizzle + this.gSwizzle + this.bSwizzle + this.aSwizzle;
        return "." + swizzle.substr(0, len);
    };
    ColorMergerBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var rInput = this.r;
        var gInput = this.g;
        var bInput = this.b;
        var aInput = this.a;
        var rgbInput = this.rgbIn;
        var color4Output = this._outputs[0];
        var color3Output = this._outputs[1];
        if (rgbInput.isConnected) {
            if (color4Output.hasEndpoints) {
                state.compilationString +=
                    this._declareOutput(color4Output, state) +
                        " = vec4(".concat(rgbInput.associatedVariableName, ", ").concat(aInput.isConnected ? this._writeVariable(aInput) : "0.0", ")").concat(this._buildSwizzle(4), ";\r\n");
            }
            if (color3Output.hasEndpoints) {
                state.compilationString += this._declareOutput(color3Output, state) + " = ".concat(rgbInput.associatedVariableName).concat(this._buildSwizzle(3), ";\r\n");
            }
        }
        else {
            if (color4Output.hasEndpoints) {
                state.compilationString +=
                    this._declareOutput(color4Output, state) +
                        " = vec4(".concat(rInput.isConnected ? this._writeVariable(rInput) : "0.0", ", ").concat(gInput.isConnected ? this._writeVariable(gInput) : "0.0", ", ").concat(bInput.isConnected ? this._writeVariable(bInput) : "0.0", ", ").concat(aInput.isConnected ? this._writeVariable(aInput) : "0.0", ")").concat(this._buildSwizzle(4), ";\r\n");
            }
            if (color3Output.hasEndpoints) {
                state.compilationString +=
                    this._declareOutput(color3Output, state) +
                        " = vec3(".concat(rInput.isConnected ? this._writeVariable(rInput) : "0.0", ", ").concat(gInput.isConnected ? this._writeVariable(gInput) : "0.0", ", ").concat(bInput.isConnected ? this._writeVariable(bInput) : "0.0", ")").concat(this._buildSwizzle(3), ";\r\n");
            }
        }
        return this;
    };
    ColorMergerBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.rSwizzle = this.rSwizzle;
        serializationObject.gSwizzle = this.gSwizzle;
        serializationObject.bSwizzle = this.bSwizzle;
        serializationObject.aSwizzle = this.aSwizzle;
        return serializationObject;
    };
    ColorMergerBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        var _a, _b, _c, _d;
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.rSwizzle = (_a = serializationObject.rSwizzle) !== null && _a !== void 0 ? _a : "r";
        this.gSwizzle = (_b = serializationObject.gSwizzle) !== null && _b !== void 0 ? _b : "g";
        this.bSwizzle = (_c = serializationObject.bSwizzle) !== null && _c !== void 0 ? _c : "b";
        this.aSwizzle = (_d = serializationObject.aSwizzle) !== null && _d !== void 0 ? _d : "a";
    };
    ColorMergerBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".rSwizzle = ").concat(this.rSwizzle, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".gSwizzle = ").concat(this.gSwizzle, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".bSwizzle = ").concat(this.bSwizzle, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".aSwizzle = ").concat(this.aSwizzle, ";\r\n");
        return codeString;
    };
    return ColorMergerBlock;
}(NodeMaterialBlock));
export { ColorMergerBlock };
RegisterClass("BABYLON.ColorMergerBlock", ColorMergerBlock);
//# sourceMappingURL=colorMergerBlock.js.map