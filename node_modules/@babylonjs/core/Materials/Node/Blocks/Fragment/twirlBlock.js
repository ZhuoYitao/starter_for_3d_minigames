import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { InputBlock } from "../Input/inputBlock.js";
import { Vector2 } from "../../../../Maths/math.vector.js";
/**
 * Block used to generate a twirl
 */
var TwirlBlock = /** @class */ (function (_super) {
    __extends(TwirlBlock, _super);
    /**
     * Creates a new TwirlBlock
     * @param name defines the block name
     */
    function TwirlBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this.registerInput("input", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerInput("strength", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerInput("center", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerInput("offset", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerOutput("x", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("y", NodeMaterialBlockConnectionPointTypes.Float);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    TwirlBlock.prototype.getClassName = function () {
        return "TwirlBlock";
    };
    Object.defineProperty(TwirlBlock.prototype, "input", {
        /**
         * Gets the input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TwirlBlock.prototype, "strength", {
        /**
         * Gets the strength component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TwirlBlock.prototype, "center", {
        /**
         * Gets the center component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TwirlBlock.prototype, "offset", {
        /**
         * Gets the offset component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TwirlBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TwirlBlock.prototype, "x", {
        /**
         * Gets the x output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TwirlBlock.prototype, "y", {
        /**
         * Gets the y output component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    TwirlBlock.prototype.autoConfigure = function () {
        if (!this.center.isConnected) {
            var centerInput = new InputBlock("center");
            centerInput.value = new Vector2(0.5, 0.5);
            centerInput.output.connectTo(this.center);
        }
        if (!this.strength.isConnected) {
            var strengthInput = new InputBlock("strength");
            strengthInput.value = 1.0;
            strengthInput.output.connectTo(this.strength);
        }
        if (!this.offset.isConnected) {
            var offsetInput = new InputBlock("offset");
            offsetInput.value = new Vector2(0, 0);
            offsetInput.output.connectTo(this.offset);
        }
    };
    TwirlBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var tempDelta = state._getFreeVariableName("delta");
        var tempAngle = state._getFreeVariableName("angle");
        var tempX = state._getFreeVariableName("x");
        var tempY = state._getFreeVariableName("y");
        var tempResult = state._getFreeVariableName("result");
        state.compilationString += "\n            vec2 ".concat(tempDelta, " = ").concat(this.input.associatedVariableName, " - ").concat(this.center.associatedVariableName, ";\n            float ").concat(tempAngle, " = ").concat(this.strength.associatedVariableName, " * length(").concat(tempDelta, ");\n            float ").concat(tempX, " = cos(").concat(tempAngle, ") * ").concat(tempDelta, ".x - sin(").concat(tempAngle, ") * ").concat(tempDelta, ".y;\n            float ").concat(tempY, " = sin(").concat(tempAngle, ") * ").concat(tempDelta, ".x + cos(").concat(tempAngle, ") * ").concat(tempDelta, ".y;\n            vec2 ").concat(tempResult, " = vec2(").concat(tempX, " + ").concat(this.center.associatedVariableName, ".x + ").concat(this.offset.associatedVariableName, ".x, ").concat(tempY, " + ").concat(this.center.associatedVariableName, ".y + ").concat(this.offset.associatedVariableName, ".y);\n        ");
        if (this.output.hasEndpoints) {
            state.compilationString += this._declareOutput(this.output, state) + " = ".concat(tempResult, ";\r\n");
        }
        if (this.x.hasEndpoints) {
            state.compilationString += this._declareOutput(this.x, state) + " = ".concat(tempResult, ".x;\r\n");
        }
        if (this.y.hasEndpoints) {
            state.compilationString += this._declareOutput(this.y, state) + " = ".concat(tempResult, ".y;\r\n");
        }
        return this;
    };
    return TwirlBlock;
}(NodeMaterialBlock));
export { TwirlBlock };
RegisterClass("BABYLON.TwirlBlock", TwirlBlock);
//# sourceMappingURL=twirlBlock.js.map