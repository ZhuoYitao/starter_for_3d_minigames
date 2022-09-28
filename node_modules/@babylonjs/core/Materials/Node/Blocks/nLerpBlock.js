import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to normalize lerp between 2 values
 */
var NLerpBlock = /** @class */ (function (_super) {
    __extends(NLerpBlock, _super);
    /**
     * Creates a new NLerpBlock
     * @param name defines the block name
     */
    function NLerpBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("left", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("right", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("gradient", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        _this._linkConnectionTypes(0, 1);
        _this._linkConnectionTypes(1, 2, true);
        _this._inputs[2].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Float);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    NLerpBlock.prototype.getClassName = function () {
        return "NLerpBlock";
    };
    Object.defineProperty(NLerpBlock.prototype, "left", {
        /**
         * Gets the left operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NLerpBlock.prototype, "right", {
        /**
         * Gets the right operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NLerpBlock.prototype, "gradient", {
        /**
         * Gets the gradient operand input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NLerpBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    NLerpBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString +=
            this._declareOutput(output, state) +
                " = normalize(mix(".concat(this.left.associatedVariableName, " , ").concat(this.right.associatedVariableName, ", ").concat(this.gradient.associatedVariableName, "));\r\n");
        return this;
    };
    return NLerpBlock;
}(NodeMaterialBlock));
export { NLerpBlock };
RegisterClass("BABYLON.NLerpBlock", NLerpBlock);
//# sourceMappingURL=nLerpBlock.js.map