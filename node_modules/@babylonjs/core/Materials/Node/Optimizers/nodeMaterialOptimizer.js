/**
 * Root class for all node material optimizers
 */
var NodeMaterialOptimizer = /** @class */ (function () {
    function NodeMaterialOptimizer() {
    }
    /**
     * Function used to optimize a NodeMaterial graph
     * @param _vertexOutputNodes defines the list of output nodes for the vertex shader
     * @param _fragmentOutputNodes defines the list of output nodes for the fragment shader
     */
    NodeMaterialOptimizer.prototype.optimize = function (_vertexOutputNodes, _fragmentOutputNodes) {
        // Do nothing by default
    };
    return NodeMaterialOptimizer;
}());
export { NodeMaterialOptimizer };
//# sourceMappingURL=nodeMaterialOptimizer.js.map