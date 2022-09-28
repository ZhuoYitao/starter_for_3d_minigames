import { __extends } from "tslib";
import { NodeMaterialConnectionPoint, NodeMaterialConnectionPointCompatibilityStates } from "./nodeMaterialBlockConnectionPoint.js";
/**
 * Defines a connection point to be used for points with a custom object type
 */
var NodeMaterialConnectionPointCustomObject = /** @class */ (function (_super) {
    __extends(NodeMaterialConnectionPointCustomObject, _super);
    /**
     * Creates a new connection point
     * @param name defines the connection point name
     * @param ownerBlock defines the block hosting this connection point
     * @param direction defines the direction of the connection point
     * @param _blockType
     * @param _blockName
     * @param _nameForCheking
     */
    function NodeMaterialConnectionPointCustomObject(name, ownerBlock, direction, _blockType, _blockName, _nameForCheking) {
        var _this = _super.call(this, name, ownerBlock, direction) || this;
        _this._blockType = _blockType;
        _this._blockName = _blockName;
        _this._nameForCheking = _nameForCheking;
        if (!_this._nameForCheking) {
            _this._nameForCheking = name;
        }
        _this.needDualDirectionValidation = true;
        return _this;
    }
    /**
     * Gets a number indicating if the current point can be connected to another point
     * @param connectionPoint defines the other connection point
     * @returns a number defining the compatibility state
     */
    NodeMaterialConnectionPointCustomObject.prototype.checkCompatibilityState = function (connectionPoint) {
        return connectionPoint instanceof NodeMaterialConnectionPointCustomObject && connectionPoint.name === this._nameForCheking
            ? NodeMaterialConnectionPointCompatibilityStates.Compatible
            : NodeMaterialConnectionPointCompatibilityStates.TypeIncompatible;
    };
    /**
     * Creates a block suitable to be used as an input for this input point.
     * If null is returned, a block based on the point type will be created.
     * @returns The returned string parameter is the name of the output point of NodeMaterialBlock (first parameter of the returned array) that can be connected to the input
     */
    NodeMaterialConnectionPointCustomObject.prototype.createCustomInputBlock = function () {
        return [new this._blockType(this._blockName), this.name];
    };
    return NodeMaterialConnectionPointCustomObject;
}(NodeMaterialConnectionPoint));
export { NodeMaterialConnectionPointCustomObject };
//# sourceMappingURL=nodeMaterialConnectionPointCustomObject.js.map