import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * Block used to discard a pixel if a value is smaller than a cutoff
 */
var DiscardBlock = /** @class */ (function (_super) {
    __extends(DiscardBlock, _super);
    /**
     * Create a new DiscardBlock
     * @param name defines the block name
     */
    function DiscardBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment, true) || this;
        _this.registerInput("value", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("cutoff", NodeMaterialBlockConnectionPointTypes.Float, true);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    DiscardBlock.prototype.getClassName = function () {
        return "DiscardBlock";
    };
    Object.defineProperty(DiscardBlock.prototype, "value", {
        /**
         * Gets the color input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DiscardBlock.prototype, "cutoff", {
        /**
         * Gets the cutoff input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    DiscardBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        state.sharedData.hints.needAlphaTesting = true;
        if (!this.cutoff.isConnected || !this.value.isConnected) {
            return;
        }
        state.compilationString += "if (".concat(this.value.associatedVariableName, " < ").concat(this.cutoff.associatedVariableName, ") discard;\r\n");
        return this;
    };
    return DiscardBlock;
}(NodeMaterialBlock));
export { DiscardBlock };
RegisterClass("BABYLON.DiscardBlock", DiscardBlock);
//# sourceMappingURL=discardBlock.js.map