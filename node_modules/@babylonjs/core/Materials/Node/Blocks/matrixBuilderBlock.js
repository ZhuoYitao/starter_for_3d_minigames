import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { InputBlock } from "./Input/inputBlock.js";
import { Vector4 } from "../../../Maths/math.vector.js";
/**
 * Block used to build a matrix from 4 Vector4
 */
var MatrixBuilderBlock = /** @class */ (function (_super) {
    __extends(MatrixBuilderBlock, _super);
    /**
     * Creates a new MatrixBuilder
     * @param name defines the block name
     */
    function MatrixBuilderBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("row0", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerInput("row1", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerInput("row2", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerInput("row3", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Matrix);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    MatrixBuilderBlock.prototype.getClassName = function () {
        return "MatrixBuilder";
    };
    Object.defineProperty(MatrixBuilderBlock.prototype, "row0", {
        /**
         * Gets the row0 vector
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MatrixBuilderBlock.prototype, "row1", {
        /**
         * Gets the row1 vector
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MatrixBuilderBlock.prototype, "row2", {
        /**
         * Gets the row2 vector
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MatrixBuilderBlock.prototype, "row3", {
        /**
         * Gets the row3 vector
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MatrixBuilderBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    MatrixBuilderBlock.prototype.autoConfigure = function () {
        if (!this.row0.isConnected) {
            var row0Input = new InputBlock("row0");
            row0Input.value = new Vector4(1, 0, 0, 0);
            row0Input.output.connectTo(this.row0);
        }
        if (!this.row1.isConnected) {
            var row1Input = new InputBlock("row1");
            row1Input.value = new Vector4(0, 1, 0, 0);
            row1Input.output.connectTo(this.row1);
        }
        if (!this.row2.isConnected) {
            var row2Input = new InputBlock("row2");
            row2Input.value = new Vector4(0, 0, 1, 0);
            row2Input.output.connectTo(this.row2);
        }
        if (!this.row3.isConnected) {
            var row3Input = new InputBlock("row3");
            row3Input.value = new Vector4(0, 0, 0, 1);
            row3Input.output.connectTo(this.row3);
        }
    };
    MatrixBuilderBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        var row0 = this.row0;
        var row1 = this.row1;
        var row2 = this.row2;
        var row3 = this.row3;
        state.compilationString +=
            this._declareOutput(output, state) +
                " = mat4(".concat(row0.associatedVariableName, ", ").concat(row1.associatedVariableName, ", ").concat(row2.associatedVariableName, ", ").concat(row3.associatedVariableName, ");\r\n");
        return this;
    };
    return MatrixBuilderBlock;
}(NodeMaterialBlock));
export { MatrixBuilderBlock };
RegisterClass("BABYLON.MatrixBuilder", MatrixBuilderBlock);
//# sourceMappingURL=matrixBuilderBlock.js.map