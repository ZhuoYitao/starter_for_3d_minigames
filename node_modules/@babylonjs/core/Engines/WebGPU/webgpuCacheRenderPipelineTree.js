import { __extends } from "tslib";
import { WebGPUCacheRenderPipeline } from "./webgpuCacheRenderPipeline.js";
/** @hidden */
var NodeState = /** @class */ (function () {
    function NodeState() {
        this.values = {};
    }
    NodeState.prototype.count = function () {
        var countNode = 0, countPipeline = this.pipeline ? 1 : 0;
        for (var value in this.values) {
            var node = this.values[value];
            var _a = node.count(), childCountNodes = _a[0], childCoundPipeline = _a[1];
            countNode += childCountNodes;
            countPipeline += childCoundPipeline;
            countNode++;
        }
        return [countNode, countPipeline];
    };
    return NodeState;
}());
/** @hidden */
var WebGPUCacheRenderPipelineTree = /** @class */ (function (_super) {
    __extends(WebGPUCacheRenderPipelineTree, _super);
    function WebGPUCacheRenderPipelineTree(device, emptyVertexBuffer, useTextureStage) {
        var _this = _super.call(this, device, emptyVertexBuffer, useTextureStage) || this;
        _this._nodeStack = [];
        _this._nodeStack[0] = WebGPUCacheRenderPipelineTree._Cache;
        return _this;
    }
    WebGPUCacheRenderPipelineTree.GetNodeCounts = function () {
        var counts = WebGPUCacheRenderPipelineTree._Cache.count();
        return { nodeCount: counts[0], pipelineCount: counts[1] };
    };
    WebGPUCacheRenderPipelineTree._GetPipelines = function (node, pipelines, curPath, curPathLen) {
        if (node.pipeline) {
            var path = curPath.slice();
            path.length = curPathLen;
            pipelines.push(path);
        }
        for (var value in node.values) {
            var nnode = node.values[value];
            curPath[curPathLen] = parseInt(value);
            WebGPUCacheRenderPipelineTree._GetPipelines(nnode, pipelines, curPath, curPathLen + 1);
        }
    };
    WebGPUCacheRenderPipelineTree.GetPipelines = function () {
        var pipelines = [];
        WebGPUCacheRenderPipelineTree._GetPipelines(WebGPUCacheRenderPipelineTree._Cache, pipelines, [], 0);
        return pipelines;
    };
    WebGPUCacheRenderPipelineTree.prototype._getRenderPipeline = function (param) {
        var node = this._nodeStack[this._stateDirtyLowestIndex];
        for (var i = this._stateDirtyLowestIndex; i < this._statesLength; ++i) {
            var nn = node.values[this._states[i]];
            if (!nn) {
                nn = new NodeState();
                node.values[this._states[i]] = nn;
            }
            node = nn;
            this._nodeStack[i + 1] = node;
        }
        param.token = node;
        param.pipeline = node.pipeline;
    };
    WebGPUCacheRenderPipelineTree.prototype._setRenderPipeline = function (param) {
        param.token.pipeline = param.pipeline;
    };
    WebGPUCacheRenderPipelineTree._Cache = new NodeState();
    return WebGPUCacheRenderPipelineTree;
}(WebGPUCacheRenderPipeline));
export { WebGPUCacheRenderPipelineTree };
//# sourceMappingURL=webgpuCacheRenderPipelineTree.js.map