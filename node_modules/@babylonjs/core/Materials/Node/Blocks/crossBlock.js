import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to apply a cross product between 2 vectors
 */
var CrossBlock = /** @class */ (function (_super) {
    __extends(CrossBlock, _super);
    /**
     * Creates a new CrossBlock
     * @param name defines the block name
     */
    function CrossBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("left", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("right", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._linkConnectionTypes(0, 1);
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Float);
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Matrix);
        _this._inputs[0].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector2);
        _this._inputs[1].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Float);
        _this._inputs[1].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Matrix);
        _this._inputs[1].excludedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector2);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    CrossBlock.prototype.getClassName = function () {
        return "CrossBlock";
    };
    Object.defineProperty(CrossBlock.prototype, "left", {
        /**
         * Gets the left operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CrossBlock.prototype, "right", {
        /**
         * Gets the right operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CrossBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    CrossBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = cross(".concat(this.left.associatedVariableName, ".xyz, ").concat(this.right.associatedVariableName, ".xyz);\r\n");
        return this;
    };
    return CrossBlock;
}(NodeMaterialBlock));
export { CrossBlock };
RegisterClass("BABYLON.CrossBlock", CrossBlock);
//# sourceMappingURL=crossBlock.js.map