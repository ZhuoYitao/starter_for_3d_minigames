import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to apply a dot product between 2 vectors
 */
var DotBlock = /** @class */ (function (_super) {
    __extends(DotBlock, _super);
    /**
     * Creates a new DotBlock
     * @param name defines the block name
     */
    function DotBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("left", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("right", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Float);
        _this._linkConnectionTypes(0, 1);
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Float);
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Matrix);
        _this._inputs[1].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Float);
        _this._inputs[1].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Matrix);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    DotBlock.prototype.getClassName = function () {
        return "DotBlock";
    };
    Object.defineProperty(DotBlock.prototype, "left", {
        /**
         * Gets the left operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DotBlock.prototype, "right", {
        /**
         * Gets the right operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DotBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    DotBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = dot(".concat(this.left.associatedVariableName, ", ").concat(this.right.associatedVariableName, ");\r\n");
        return this;
    };
    return DotBlock;
}(NodeMaterialBlock));
export { DotBlock };
RegisterClass("BABYLON.DotBlock", DotBlock);
//# sourceMappingURL=dotBlock.js.map