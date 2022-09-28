import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used as a pass through
 */
var ElbowBlock = /** @class */ (function (_super) {
    __extends(ElbowBlock, _super);
    /**
     * Creates a new ElbowBlock
     * @param name defines the block name
     */
    function ElbowBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("input", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ElbowBlock.prototype.getClassName = function () {
        return "ElbowBlock";
    };
    Object.defineProperty(ElbowBlock.prototype, "input", {
        /**
         * Gets the input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElbowBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElbowBlock.prototype, "target", {
        /**
         * Gets or sets the target of the block
         */
        get: function () {
            var input = this._inputs[0];
            if (input.isConnected) {
                var block = input.connectedPoint.ownerBlock;
                // Return vertex if connected to an input node
                if (block.isInput) {
                    return NodeMaterialBlockTargets.Vertex;
                }
            }
            return this._target;
        },
        set: function (value) {
            if ((this._target & value) !== 0) {
                return;
            }
            this._target = value;
        },
        enumerable: false,
        configurable: true
    });
    ElbowBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        var input = this._inputs[0];
        state.compilationString += this._declareOutput(output, state) + " = ".concat(input.associatedVariableName, ";\r\n");
        return this;
    };
    return ElbowBlock;
}(NodeMaterialBlock));
export { ElbowBlock };
RegisterClass("BABYLON.ElbowBlock", ElbowBlock);
//# sourceMappingURL=elbowBlock.js.map