import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to divide 2 vectors
 */
var DivideBlock = /** @class */ (function (_super) {
    __extends(DivideBlock, _super);
    /**
     * Creates a new DivideBlock
     * @param name defines the block name
     */
    function DivideBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("left", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("right", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        _this._linkConnectionTypes(0, 1);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    DivideBlock.prototype.getClassName = function () {
        return "DivideBlock";
    };
    Object.defineProperty(DivideBlock.prototype, "left", {
        /**
         * Gets the left operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DivideBlock.prototype, "right", {
        /**
         * Gets the right operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DivideBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    DivideBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = ".concat(this.left.associatedVariableName, " / ").concat(this.right.associatedVariableName, ";\r\n");
        return this;
    };
    return DivideBlock;
}(NodeMaterialBlock));
export { DivideBlock };
RegisterClass("BABYLON.DivideBlock", DivideBlock);
//# sourceMappingURL=divideBlock.js.map