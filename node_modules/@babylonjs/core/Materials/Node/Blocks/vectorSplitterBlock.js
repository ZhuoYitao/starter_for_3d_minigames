import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to expand a Vector3/4 into 4 outputs (one for each component)
 */
var VectorSplitterBlock = /** @class */ (function (_super) {
    __extends(VectorSplitterBlock, _super);
    /**
     * Create a new VectorSplitterBlock
     * @param name defines the block name
     */
    function VectorSplitterBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("xyzw", NodeMaterialBlockConnectionPointTypes.Vector4, true);
        _this.registerInput("xyz ", NodeMaterialBlockConnectionPointTypes.Vector3, true);
        _this.registerInput("xy ", NodeMaterialBlockConnectionPointTypes.Vector2, true);
        _this.registerOutput("xyz", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerOutput("xy", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerOutput("zw", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerOutput("x", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("y", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("z", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("w", NodeMaterialBlockConnectionPointTypes.Float);
        _this.inputsAreExclusive = true;
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    VectorSplitterBlock.prototype.getClassName = function () {
        return "VectorSplitterBlock";
    };
    Object.defineProperty(VectorSplitterBlock.prototype, "xyzw", {
        /**
         * Gets the xyzw component (input)
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorSplitterBlock.prototype, "xyzIn", {
        /**
         * Gets the xyz component (input)
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorSplitterBlock.prototype, "xyIn", {
        /**
         * Gets the xy component (input)
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorSplitterBlock.prototype, "xyzOut", {
        /**
         * Gets the xyz component (output)
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorSplitterBlock.prototype, "xyOut", {
        /**
         * Gets the xy component (output)
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorSplitterBlock.prototype, "zw", {
        /**
         * Gets the zw component (output)
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorSplitterBlock.prototype, "x", {
        /**
         * Gets the x component (output)
         */
        get: function () {
            return this._outputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorSplitterBlock.prototype, "y", {
        /**
         * Gets the y component (output)
         */
        get: function () {
            return this._outputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorSplitterBlock.prototype, "z", {
        /**
         * Gets the z component (output)
         */
        get: function () {
            return this._outputs[5];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorSplitterBlock.prototype, "w", {
        /**
         * Gets the w component (output)
         */
        get: function () {
            return this._outputs[6];
        },
        enumerable: false,
        configurable: true
    });
    VectorSplitterBlock.prototype._inputRename = function (name) {
        switch (name) {
            case "xy ":
                return "xyIn";
            case "xyz ":
                return "xyzIn";
            default:
                return name;
        }
    };
    VectorSplitterBlock.prototype._outputRename = function (name) {
        switch (name) {
            case "xy":
                return "xyOut";
            case "xyz":
                return "xyzOut";
            default:
                return name;
        }
    };
    VectorSplitterBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var input = this.xyzw.isConnected ? this.xyzw : this.xyzIn.isConnected ? this.xyzIn : this.xyIn;
        var xyzOutput = this._outputs[0];
        var xyOutput = this._outputs[1];
        var zwOutput = this._outputs[2];
        var xOutput = this._outputs[3];
        var yOutput = this._outputs[4];
        var zOutput = this._outputs[5];
        var wOutput = this._outputs[6];
        if (xyzOutput.hasEndpoints) {
            if (input === this.xyIn) {
                state.compilationString += this._declareOutput(xyzOutput, state) + " = vec3(".concat(input.associatedVariableName, ", 0.0);\r\n");
            }
            else {
                state.compilationString += this._declareOutput(xyzOutput, state) + " = ".concat(input.associatedVariableName, ".xyz;\r\n");
            }
        }
        if (zwOutput.hasEndpoints && this.xyzw.isConnected) {
            state.compilationString += this._declareOutput(zwOutput, state) + " = ".concat(this.xyzw.associatedVariableName, ".zw;\r\n");
        }
        if (xyOutput.hasEndpoints) {
            state.compilationString += this._declareOutput(xyOutput, state) + " = ".concat(input.associatedVariableName, ".xy;\r\n");
        }
        if (xOutput.hasEndpoints) {
            state.compilationString += this._declareOutput(xOutput, state) + " = ".concat(input.associatedVariableName, ".x;\r\n");
        }
        if (yOutput.hasEndpoints) {
            state.compilationString += this._declareOutput(yOutput, state) + " = ".concat(input.associatedVariableName, ".y;\r\n");
        }
        if (zOutput.hasEndpoints) {
            state.compilationString += this._declareOutput(zOutput, state) + " = ".concat(input.associatedVariableName, ".z;\r\n");
        }
        if (wOutput.hasEndpoints) {
            state.compilationString += this._declareOutput(wOutput, state) + " = ".concat(input.associatedVariableName, ".w;\r\n");
        }
        return this;
    };
    return VectorSplitterBlock;
}(NodeMaterialBlock));
export { VectorSplitterBlock };
RegisterClass("BABYLON.VectorSplitterBlock", VectorSplitterBlock);
//# sourceMappingURL=vectorSplitterBlock.js.map