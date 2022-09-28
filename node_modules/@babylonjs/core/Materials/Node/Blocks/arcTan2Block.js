import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to compute arc tangent of 2 values
 */
var ArcTan2Block = /** @class */ (function (_super) {
    __extends(ArcTan2Block, _super);
    /**
     * Creates a new ArcTan2Block
     * @param name defines the block name
     */
    function ArcTan2Block(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("x", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerInput("y", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Float);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ArcTan2Block.prototype.getClassName = function () {
        return "ArcTan2Block";
    };
    Object.defineProperty(ArcTan2Block.prototype, "x", {
        /**
         * Gets the x operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ArcTan2Block.prototype, "y", {
        /**
         * Gets the y operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ArcTan2Block.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    ArcTan2Block.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = atan(".concat(this.x.associatedVariableName, ", ").concat(this.y.associatedVariableName, ");\r\n");
        return this;
    };
    return ArcTan2Block;
}(NodeMaterialBlock));
export { ArcTan2Block };
RegisterClass("BABYLON.ArcTan2Block", ArcTan2Block);
//# sourceMappingURL=arcTan2Block.js.map