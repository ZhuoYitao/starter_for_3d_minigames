import { __extends } from "tslib";
import { VertexBuffer } from "../Buffers/buffer.js";
import { AbstractMesh } from "../Meshes/abstractMesh.js";
import { LinesMesh, InstancedLinesMesh } from "../Meshes/linesMesh.js";
import { Vector3, TmpVectors } from "../Maths/math.vector.js";
import { Material } from "../Materials/material.js";
import { ShaderMaterial } from "../Materials/shaderMaterial.js";
import { Camera } from "../Cameras/camera.js";

import "../Shaders/line.fragment.js";
import "../Shaders/line.vertex.js";
import { SmartArray } from "../Misc/smartArray.js";
import { Tools } from "../Misc/tools.js";
import { DrawWrapper } from "../Materials/drawWrapper.js";
AbstractMesh.prototype.disableEdgesRendering = function () {
    if (this._edgesRenderer) {
        this._edgesRenderer.dispose();
        this._edgesRenderer = null;
    }
    return this;
};
AbstractMesh.prototype.enableEdgesRendering = function (epsilon, checkVerticesInsteadOfIndices, options) {
    if (epsilon === void 0) { epsilon = 0.95; }
    if (checkVerticesInsteadOfIndices === void 0) { checkVerticesInsteadOfIndices = false; }
    this.disableEdgesRendering();
    this._edgesRenderer = new EdgesRenderer(this, epsilon, checkVerticesInsteadOfIndices, true, options);
    return this;
};
Object.defineProperty(AbstractMesh.prototype, "edgesRenderer", {
    get: function () {
        return this._edgesRenderer;
    },
    enumerable: true,
    configurable: true,
});
LinesMesh.prototype.enableEdgesRendering = function (epsilon, checkVerticesInsteadOfIndices) {
    if (epsilon === void 0) { epsilon = 0.95; }
    if (checkVerticesInsteadOfIndices === void 0) { checkVerticesInsteadOfIndices = false; }
    this.disableEdgesRendering();
    this._edgesRenderer = new LineEdgesRenderer(this, epsilon, checkVerticesInsteadOfIndices);
    return this;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
InstancedLinesMesh.prototype.enableEdgesRendering = function (epsilon, checkVerticesInsteadOfIndices) {
    if (epsilon === void 0) { epsilon = 0.95; }
    if (checkVerticesInsteadOfIndices === void 0) { checkVerticesInsteadOfIndices = false; }
    LinesMesh.prototype.enableEdgesRendering.apply(this, arguments);
    return this;
};
/**
 * FaceAdjacencies Helper class to generate edges
 */
var FaceAdjacencies = /** @class */ (function () {
    function FaceAdjacencies() {
        this.edges = new Array();
        this.edgesConnectedCount = 0;
    }
    return FaceAdjacencies;
}());
/**
 * This class is used to generate edges of the mesh that could then easily be rendered in a scene.
 */
var EdgesRenderer = /** @class */ (function () {
    /**
     * Creates an instance of the EdgesRenderer. It is primarily use to display edges of a mesh.
     * Beware when you use this class with complex objects as the adjacencies computation can be really long
     * @param  source Mesh used to create edges
     * @param  epsilon sum of angles in adjacency to check for edge
     * @param  checkVerticesInsteadOfIndices bases the edges detection on vertices vs indices. Note that this parameter is not used if options.useAlternateEdgeFinder = true
     * @param  generateEdgesLines - should generate Lines or only prepare resources.
     * @param  options The options to apply when generating the edges
     */
    function EdgesRenderer(source, epsilon, checkVerticesInsteadOfIndices, generateEdgesLines, options) {
        if (epsilon === void 0) { epsilon = 0.95; }
        if (checkVerticesInsteadOfIndices === void 0) { checkVerticesInsteadOfIndices = false; }
        if (generateEdgesLines === void 0) { generateEdgesLines = true; }
        var _this = this;
        var _a;
        /**
         * Define the size of the edges with an orthographic camera
         */
        this.edgesWidthScalerForOrthographic = 1000.0;
        /**
         * Define the size of the edges with a perspective camera
         */
        this.edgesWidthScalerForPerspective = 50.0;
        this._linesPositions = new Array();
        this._linesNormals = new Array();
        this._linesIndices = new Array();
        this._buffers = {};
        this._buffersForInstances = {};
        this._checkVerticesInsteadOfIndices = false;
        /** Gets or sets a boolean indicating if the edgesRenderer is active */
        this.isEnabled = true;
        /**
         * List of instances to render in case the source mesh has instances
         */
        this.customInstances = new SmartArray(32);
        this._source = source;
        this._checkVerticesInsteadOfIndices = checkVerticesInsteadOfIndices;
        this._options = options !== null && options !== void 0 ? options : null;
        this._epsilon = epsilon;
        if (this._source.getScene().getEngine().isWebGPU) {
            this._drawWrapper = new DrawWrapper(source.getEngine());
        }
        this._prepareRessources();
        if (generateEdgesLines) {
            if ((_a = options === null || options === void 0 ? void 0 : options.useAlternateEdgeFinder) !== null && _a !== void 0 ? _a : true) {
                this._generateEdgesLinesAlternate();
            }
            else {
                this._generateEdgesLines();
            }
        }
        this._meshRebuildObserver = this._source.onRebuildObservable.add(function () {
            _this._rebuild();
        });
        this._meshDisposeObserver = this._source.onDisposeObservable.add(function () {
            _this.dispose();
        });
    }
    Object.defineProperty(EdgesRenderer.prototype, "linesPositions", {
        /** Gets the vertices generated by the edge renderer */
        get: function () {
            return this._linesPositions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EdgesRenderer.prototype, "linesNormals", {
        /** Gets the normals generated by the edge renderer */
        get: function () {
            return this._linesNormals;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EdgesRenderer.prototype, "linesIndices", {
        /** Gets the indices generated by the edge renderer */
        get: function () {
            return this._linesIndices;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EdgesRenderer.prototype, "lineShader", {
        /**
         * Gets or sets the shader used to draw the lines
         */
        get: function () {
            return this._lineShader;
        },
        set: function (shader) {
            this._lineShader = shader;
        },
        enumerable: false,
        configurable: true
    });
    EdgesRenderer._GetShader = function (scene) {
        if (!scene._edgeRenderLineShader) {
            var shader = new ShaderMaterial("lineShader", scene, "line", {
                attributes: ["position", "normal"],
                uniforms: ["world", "viewProjection", "color", "width", "aspectRatio"],
            }, false);
            shader.disableDepthWrite = true;
            shader.backFaceCulling = false;
            shader.checkReadyOnEveryCall = scene.getEngine().isWebGPU;
            scene._edgeRenderLineShader = shader;
        }
        return scene._edgeRenderLineShader;
    };
    EdgesRenderer.prototype._prepareRessources = function () {
        if (this._lineShader) {
            return;
        }
        this._lineShader = EdgesRenderer._GetShader(this._source.getScene());
    };
    /** @hidden */
    EdgesRenderer.prototype._rebuild = function () {
        var buffer = this._buffers[VertexBuffer.PositionKind];
        if (buffer) {
            buffer._rebuild();
        }
        buffer = this._buffers[VertexBuffer.NormalKind];
        if (buffer) {
            buffer._rebuild();
        }
        var scene = this._source.getScene();
        var engine = scene.getEngine();
        this._ib = engine.createIndexBuffer(this._linesIndices);
    };
    /**
     * Releases the required resources for the edges renderer
     */
    EdgesRenderer.prototype.dispose = function () {
        var _a;
        this._source.onRebuildObservable.remove(this._meshRebuildObserver);
        this._source.onDisposeObservable.remove(this._meshDisposeObserver);
        var buffer = this._buffers[VertexBuffer.PositionKind];
        if (buffer) {
            buffer.dispose();
            this._buffers[VertexBuffer.PositionKind] = null;
        }
        buffer = this._buffers[VertexBuffer.NormalKind];
        if (buffer) {
            buffer.dispose();
            this._buffers[VertexBuffer.NormalKind] = null;
        }
        if (this._ib) {
            this._source.getScene().getEngine()._releaseBuffer(this._ib);
        }
        this._lineShader.dispose();
        (_a = this._drawWrapper) === null || _a === void 0 ? void 0 : _a.dispose();
    };
    EdgesRenderer.prototype._processEdgeForAdjacencies = function (pa, pb, p0, p1, p2) {
        if ((pa === p0 && pb === p1) || (pa === p1 && pb === p0)) {
            return 0;
        }
        if ((pa === p1 && pb === p2) || (pa === p2 && pb === p1)) {
            return 1;
        }
        if ((pa === p2 && pb === p0) || (pa === p0 && pb === p2)) {
            return 2;
        }
        return -1;
    };
    EdgesRenderer.prototype._processEdgeForAdjacenciesWithVertices = function (pa, pb, p0, p1, p2) {
        var eps = 1e-10;
        if ((pa.equalsWithEpsilon(p0, eps) && pb.equalsWithEpsilon(p1, eps)) || (pa.equalsWithEpsilon(p1, eps) && pb.equalsWithEpsilon(p0, eps))) {
            return 0;
        }
        if ((pa.equalsWithEpsilon(p1, eps) && pb.equalsWithEpsilon(p2, eps)) || (pa.equalsWithEpsilon(p2, eps) && pb.equalsWithEpsilon(p1, eps))) {
            return 1;
        }
        if ((pa.equalsWithEpsilon(p2, eps) && pb.equalsWithEpsilon(p0, eps)) || (pa.equalsWithEpsilon(p0, eps) && pb.equalsWithEpsilon(p2, eps))) {
            return 2;
        }
        return -1;
    };
    /**
     * Checks if the pair of p0 and p1 is en edge
     * @param faceIndex
     * @param edge
     * @param faceNormals
     * @param  p0
     * @param  p1
     * @private
     */
    EdgesRenderer.prototype._checkEdge = function (faceIndex, edge, faceNormals, p0, p1) {
        var needToCreateLine;
        if (edge === undefined) {
            needToCreateLine = true;
        }
        else {
            var dotProduct = Vector3.Dot(faceNormals[faceIndex], faceNormals[edge]);
            needToCreateLine = dotProduct < this._epsilon;
        }
        if (needToCreateLine) {
            this.createLine(p0, p1, this._linesPositions.length / 3);
        }
    };
    /**
     * push line into the position, normal and index buffer
     * @param p0
     * @param p1
     * @param offset
     * @protected
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    EdgesRenderer.prototype.createLine = function (p0, p1, offset) {
        // Positions
        this._linesPositions.push(p0.x, p0.y, p0.z, p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p1.x, p1.y, p1.z);
        // Normals
        this._linesNormals.push(p1.x, p1.y, p1.z, -1, p1.x, p1.y, p1.z, 1, p0.x, p0.y, p0.z, -1, p0.x, p0.y, p0.z, 1);
        // Indices
        this._linesIndices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
    };
    /**
     * See https://playground.babylonjs.com/#R3JR6V#1 for a visual display of the algorithm
     * @param edgePoints
     * @param indexTriangle
     * @param indices
     * @param remapVertexIndices
     */
    EdgesRenderer.prototype._tessellateTriangle = function (edgePoints, indexTriangle, indices, remapVertexIndices) {
        var makePointList = function (edgePoints, pointIndices, firstIndex) {
            if (firstIndex >= 0) {
                pointIndices.push(firstIndex);
            }
            for (var i = 0; i < edgePoints.length; ++i) {
                pointIndices.push(edgePoints[i][0]);
            }
        };
        var startEdge = 0;
        if (edgePoints[1].length >= edgePoints[0].length && edgePoints[1].length >= edgePoints[2].length) {
            startEdge = 1;
        }
        else if (edgePoints[2].length >= edgePoints[0].length && edgePoints[2].length >= edgePoints[1].length) {
            startEdge = 2;
        }
        for (var e = 0; e < 3; ++e) {
            if (e === startEdge) {
                edgePoints[e].sort(function (a, b) { return (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0); });
            }
            else {
                edgePoints[e].sort(function (a, b) { return (a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0); });
            }
        }
        var mainPointIndices = [], otherPointIndices = [];
        makePointList(edgePoints[startEdge], mainPointIndices, -1);
        var numMainPoints = mainPointIndices.length;
        for (var i = startEdge + 2; i >= startEdge + 1; --i) {
            makePointList(edgePoints[i % 3], otherPointIndices, i !== startEdge + 2 ? remapVertexIndices[indices[indexTriangle + ((i + 1) % 3)]] : -1);
        }
        var numOtherPoints = otherPointIndices.length;
        var idxMain = 0;
        var idxOther = 0;
        indices.push(remapVertexIndices[indices[indexTriangle + startEdge]], mainPointIndices[0], otherPointIndices[0]);
        indices.push(remapVertexIndices[indices[indexTriangle + ((startEdge + 1) % 3)]], otherPointIndices[numOtherPoints - 1], mainPointIndices[numMainPoints - 1]);
        var bucketIsMain = numMainPoints <= numOtherPoints;
        var bucketStep = bucketIsMain ? numMainPoints : numOtherPoints;
        var bucketLimit = bucketIsMain ? numOtherPoints : numMainPoints;
        var bucketIdxLimit = bucketIsMain ? numMainPoints - 1 : numOtherPoints - 1;
        var winding = bucketIsMain ? 0 : 1;
        var numTris = numMainPoints + numOtherPoints - 2;
        var bucketIdx = bucketIsMain ? idxMain : idxOther;
        var nbucketIdx = bucketIsMain ? idxOther : idxMain;
        var bucketPoints = bucketIsMain ? mainPointIndices : otherPointIndices;
        var nbucketPoints = bucketIsMain ? otherPointIndices : mainPointIndices;
        var bucket = 0;
        while (numTris-- > 0) {
            if (winding) {
                indices.push(bucketPoints[bucketIdx], nbucketPoints[nbucketIdx]);
            }
            else {
                indices.push(nbucketPoints[nbucketIdx], bucketPoints[bucketIdx]);
            }
            bucket += bucketStep;
            var lastIdx = void 0;
            if (bucket >= bucketLimit && bucketIdx < bucketIdxLimit) {
                lastIdx = bucketPoints[++bucketIdx];
                bucket -= bucketLimit;
            }
            else {
                lastIdx = nbucketPoints[++nbucketIdx];
            }
            indices.push(lastIdx);
        }
        indices[indexTriangle + 0] = indices[indices.length - 3];
        indices[indexTriangle + 1] = indices[indices.length - 2];
        indices[indexTriangle + 2] = indices[indices.length - 1];
        indices.length = indices.length - 3;
    };
    EdgesRenderer.prototype._generateEdgesLinesAlternate = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var positions = this._source.getVerticesData(VertexBuffer.PositionKind);
        var indices = this._source.getIndices();
        if (!indices || !positions) {
            return;
        }
        if (!Array.isArray(indices)) {
            indices = Tools.SliceToArray(indices);
        }
        /**
         * Find all vertices that are at the same location (with an epsilon) and remapp them on the same vertex
         */
        var useFastVertexMerger = (_b = (_a = this._options) === null || _a === void 0 ? void 0 : _a.useFastVertexMerger) !== null && _b !== void 0 ? _b : true;
        var epsVertexMerge = useFastVertexMerger ? Math.round(-Math.log((_d = (_c = this._options) === null || _c === void 0 ? void 0 : _c.epsilonVertexMerge) !== null && _d !== void 0 ? _d : 1e-6) / Math.log(10)) : (_f = (_e = this._options) === null || _e === void 0 ? void 0 : _e.epsilonVertexMerge) !== null && _f !== void 0 ? _f : 1e-6;
        var remapVertexIndices = [];
        var uniquePositions = []; // list of unique index of vertices - needed for tessellation
        if (useFastVertexMerger) {
            var mapVertices = {};
            for (var v1 = 0; v1 < positions.length; v1 += 3) {
                var x1 = positions[v1 + 0], y1 = positions[v1 + 1], z1 = positions[v1 + 2];
                var key = x1.toFixed(epsVertexMerge) + "|" + y1.toFixed(epsVertexMerge) + "|" + z1.toFixed(epsVertexMerge);
                if (mapVertices[key] !== undefined) {
                    remapVertexIndices.push(mapVertices[key]);
                }
                else {
                    var idx = v1 / 3;
                    mapVertices[key] = idx;
                    remapVertexIndices.push(idx);
                    uniquePositions.push(idx);
                }
            }
        }
        else {
            for (var v1 = 0; v1 < positions.length; v1 += 3) {
                var x1 = positions[v1 + 0], y1 = positions[v1 + 1], z1 = positions[v1 + 2];
                var found = false;
                for (var v2 = 0; v2 < v1 && !found; v2 += 3) {
                    var x2 = positions[v2 + 0], y2 = positions[v2 + 1], z2 = positions[v2 + 2];
                    if (Math.abs(x1 - x2) < epsVertexMerge && Math.abs(y1 - y2) < epsVertexMerge && Math.abs(z1 - z2) < epsVertexMerge) {
                        remapVertexIndices.push(v2 / 3);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    remapVertexIndices.push(v1 / 3);
                    uniquePositions.push(v1 / 3);
                }
            }
        }
        if ((_g = this._options) === null || _g === void 0 ? void 0 : _g.applyTessellation) {
            /**
             * Tessellate triangles if necessary:
             *
             *               A
             *               +
             *               |\
             *               | \
             *               |  \
             *             E +   \
             *              /|    \
             *             / |     \
             *            /  |      \
             *           +---+-------+ B
             *           D   C
             *
             * For the edges to be rendered correctly, the ABC triangle has to be split into ABE and BCE, else AC is considered to be an edge, whereas only AE should be.
             *
             * The tessellation process looks for the vertices like E that are in-between two other vertices making of an edge and create new triangles as necessary
             */
            // First step: collect the triangles to tessellate
            var epsVertexAligned = (_j = (_h = this._options) === null || _h === void 0 ? void 0 : _h.epsilonVertexAligned) !== null && _j !== void 0 ? _j : 1e-6;
            var mustTesselate = []; // liste of triangles that must be tessellated
            for (var index = 0; index < indices.length; index += 3) {
                // loop over all triangles
                var triangleToTessellate = void 0;
                for (var i = 0; i < 3; ++i) {
                    // loop over the 3 edges of the triangle
                    var p0Index = remapVertexIndices[indices[index + i]];
                    var p1Index = remapVertexIndices[indices[index + ((i + 1) % 3)]];
                    var p2Index = remapVertexIndices[indices[index + ((i + 2) % 3)]];
                    if (p0Index === p1Index) {
                        continue;
                    } // degenerated triangle - don't process
                    var p0x = positions[p0Index * 3 + 0], p0y = positions[p0Index * 3 + 1], p0z = positions[p0Index * 3 + 2];
                    var p1x = positions[p1Index * 3 + 0], p1y = positions[p1Index * 3 + 1], p1z = positions[p1Index * 3 + 2];
                    var p0p1 = Math.sqrt((p1x - p0x) * (p1x - p0x) + (p1y - p0y) * (p1y - p0y) + (p1z - p0z) * (p1z - p0z));
                    for (var v = 0; v < uniquePositions.length - 1; v++) {
                        // loop over all (unique) vertices and look for the ones that would be in-between p0 and p1
                        var vIndex = uniquePositions[v];
                        if (vIndex === p0Index || vIndex === p1Index || vIndex === p2Index) {
                            continue;
                        } // don't handle the vertex if it is a vertex of the current triangle
                        var x = positions[vIndex * 3 + 0], y = positions[vIndex * 3 + 1], z = positions[vIndex * 3 + 2];
                        var p0p = Math.sqrt((x - p0x) * (x - p0x) + (y - p0y) * (y - p0y) + (z - p0z) * (z - p0z));
                        var pp1 = Math.sqrt((x - p1x) * (x - p1x) + (y - p1y) * (y - p1y) + (z - p1z) * (z - p1z));
                        if (Math.abs(p0p + pp1 - p0p1) < epsVertexAligned) {
                            // vertices are aligned and p in-between p0 and p1 if distance(p0, p) + distance (p, p1) ~ distance(p0, p1)
                            if (!triangleToTessellate) {
                                triangleToTessellate = {
                                    index: index,
                                    edgesPoints: [[], [], []],
                                };
                                mustTesselate.push(triangleToTessellate);
                            }
                            triangleToTessellate.edgesPoints[i].push([vIndex, p0p]);
                        }
                    }
                }
            }
            // Second step: tesselate the triangles
            for (var t = 0; t < mustTesselate.length; ++t) {
                var triangle = mustTesselate[t];
                this._tessellateTriangle(triangle.edgesPoints, triangle.index, indices, remapVertexIndices);
            }
            mustTesselate = null;
        }
        /**
         * Collect the edges to render
         */
        var edges = {};
        for (var index = 0; index < indices.length; index += 3) {
            var faceNormal = void 0;
            for (var i = 0; i < 3; ++i) {
                var p0Index = remapVertexIndices[indices[index + i]];
                var p1Index = remapVertexIndices[indices[index + ((i + 1) % 3)]];
                var p2Index = remapVertexIndices[indices[index + ((i + 2) % 3)]];
                if (p0Index === p1Index || ((p0Index === p2Index || p1Index === p2Index) && ((_k = this._options) === null || _k === void 0 ? void 0 : _k.removeDegeneratedTriangles))) {
                    continue;
                }
                TmpVectors.Vector3[0].copyFromFloats(positions[p0Index * 3 + 0], positions[p0Index * 3 + 1], positions[p0Index * 3 + 2]);
                TmpVectors.Vector3[1].copyFromFloats(positions[p1Index * 3 + 0], positions[p1Index * 3 + 1], positions[p1Index * 3 + 2]);
                TmpVectors.Vector3[2].copyFromFloats(positions[p2Index * 3 + 0], positions[p2Index * 3 + 1], positions[p2Index * 3 + 2]);
                if (!faceNormal) {
                    TmpVectors.Vector3[1].subtractToRef(TmpVectors.Vector3[0], TmpVectors.Vector3[3]);
                    TmpVectors.Vector3[2].subtractToRef(TmpVectors.Vector3[1], TmpVectors.Vector3[4]);
                    faceNormal = Vector3.Cross(TmpVectors.Vector3[3], TmpVectors.Vector3[4]);
                    faceNormal.normalize();
                }
                if (p0Index > p1Index) {
                    var tmp = p0Index;
                    p0Index = p1Index;
                    p1Index = tmp;
                }
                var key = p0Index + "_" + p1Index;
                var ei = edges[key];
                if (ei) {
                    if (!ei.done) {
                        var dotProduct = Vector3.Dot(faceNormal, ei.normal);
                        if (dotProduct < this._epsilon) {
                            this.createLine(TmpVectors.Vector3[0], TmpVectors.Vector3[1], this._linesPositions.length / 3);
                        }
                        ei.done = true;
                    }
                }
                else {
                    edges[key] = { normal: faceNormal, done: false, index: index, i: i };
                }
            }
        }
        for (var key in edges) {
            var ei = edges[key];
            if (!ei.done) {
                // Orphaned edge - we must display it
                var p0Index = remapVertexIndices[indices[ei.index + ei.i]];
                var p1Index = remapVertexIndices[indices[ei.index + ((ei.i + 1) % 3)]];
                TmpVectors.Vector3[0].copyFromFloats(positions[p0Index * 3 + 0], positions[p0Index * 3 + 1], positions[p0Index * 3 + 2]);
                TmpVectors.Vector3[1].copyFromFloats(positions[p1Index * 3 + 0], positions[p1Index * 3 + 1], positions[p1Index * 3 + 2]);
                this.createLine(TmpVectors.Vector3[0], TmpVectors.Vector3[1], this._linesPositions.length / 3);
            }
        }
        /**
         * Merge into a single mesh
         */
        var engine = this._source.getScene().getEngine();
        this._buffers[VertexBuffer.PositionKind] = new VertexBuffer(engine, this._linesPositions, VertexBuffer.PositionKind, false);
        this._buffers[VertexBuffer.NormalKind] = new VertexBuffer(engine, this._linesNormals, VertexBuffer.NormalKind, false, false, 4);
        this._buffersForInstances[VertexBuffer.PositionKind] = this._buffers[VertexBuffer.PositionKind];
        this._buffersForInstances[VertexBuffer.NormalKind] = this._buffers[VertexBuffer.NormalKind];
        this._ib = engine.createIndexBuffer(this._linesIndices);
        this._indicesCount = this._linesIndices.length;
    };
    /**
     * Generates lines edges from adjacencjes
     * @private
     */
    EdgesRenderer.prototype._generateEdgesLines = function () {
        var positions = this._source.getVerticesData(VertexBuffer.PositionKind);
        var indices = this._source.getIndices();
        if (!indices || !positions) {
            return;
        }
        // First let's find adjacencies
        var adjacencies = new Array();
        var faceNormals = new Array();
        var index;
        var faceAdjacencies;
        // Prepare faces
        for (index = 0; index < indices.length; index += 3) {
            faceAdjacencies = new FaceAdjacencies();
            var p0Index = indices[index];
            var p1Index = indices[index + 1];
            var p2Index = indices[index + 2];
            faceAdjacencies.p0 = new Vector3(positions[p0Index * 3], positions[p0Index * 3 + 1], positions[p0Index * 3 + 2]);
            faceAdjacencies.p1 = new Vector3(positions[p1Index * 3], positions[p1Index * 3 + 1], positions[p1Index * 3 + 2]);
            faceAdjacencies.p2 = new Vector3(positions[p2Index * 3], positions[p2Index * 3 + 1], positions[p2Index * 3 + 2]);
            var faceNormal = Vector3.Cross(faceAdjacencies.p1.subtract(faceAdjacencies.p0), faceAdjacencies.p2.subtract(faceAdjacencies.p1));
            faceNormal.normalize();
            faceNormals.push(faceNormal);
            adjacencies.push(faceAdjacencies);
        }
        // Scan
        for (index = 0; index < adjacencies.length; index++) {
            faceAdjacencies = adjacencies[index];
            for (var otherIndex = index + 1; otherIndex < adjacencies.length; otherIndex++) {
                var otherFaceAdjacencies = adjacencies[otherIndex];
                if (faceAdjacencies.edgesConnectedCount === 3) {
                    // Full
                    break;
                }
                if (otherFaceAdjacencies.edgesConnectedCount === 3) {
                    // Full
                    continue;
                }
                var otherP0 = indices[otherIndex * 3];
                var otherP1 = indices[otherIndex * 3 + 1];
                var otherP2 = indices[otherIndex * 3 + 2];
                for (var edgeIndex = 0; edgeIndex < 3; edgeIndex++) {
                    var otherEdgeIndex = 0;
                    if (faceAdjacencies.edges[edgeIndex] !== undefined) {
                        continue;
                    }
                    switch (edgeIndex) {
                        case 0:
                            if (this._checkVerticesInsteadOfIndices) {
                                otherEdgeIndex = this._processEdgeForAdjacenciesWithVertices(faceAdjacencies.p0, faceAdjacencies.p1, otherFaceAdjacencies.p0, otherFaceAdjacencies.p1, otherFaceAdjacencies.p2);
                            }
                            else {
                                otherEdgeIndex = this._processEdgeForAdjacencies(indices[index * 3], indices[index * 3 + 1], otherP0, otherP1, otherP2);
                            }
                            break;
                        case 1:
                            if (this._checkVerticesInsteadOfIndices) {
                                otherEdgeIndex = this._processEdgeForAdjacenciesWithVertices(faceAdjacencies.p1, faceAdjacencies.p2, otherFaceAdjacencies.p0, otherFaceAdjacencies.p1, otherFaceAdjacencies.p2);
                            }
                            else {
                                otherEdgeIndex = this._processEdgeForAdjacencies(indices[index * 3 + 1], indices[index * 3 + 2], otherP0, otherP1, otherP2);
                            }
                            break;
                        case 2:
                            if (this._checkVerticesInsteadOfIndices) {
                                otherEdgeIndex = this._processEdgeForAdjacenciesWithVertices(faceAdjacencies.p2, faceAdjacencies.p0, otherFaceAdjacencies.p0, otherFaceAdjacencies.p1, otherFaceAdjacencies.p2);
                            }
                            else {
                                otherEdgeIndex = this._processEdgeForAdjacencies(indices[index * 3 + 2], indices[index * 3], otherP0, otherP1, otherP2);
                            }
                            break;
                    }
                    if (otherEdgeIndex === -1) {
                        continue;
                    }
                    faceAdjacencies.edges[edgeIndex] = otherIndex;
                    otherFaceAdjacencies.edges[otherEdgeIndex] = index;
                    faceAdjacencies.edgesConnectedCount++;
                    otherFaceAdjacencies.edgesConnectedCount++;
                    if (faceAdjacencies.edgesConnectedCount === 3) {
                        break;
                    }
                }
            }
        }
        // Create lines
        for (index = 0; index < adjacencies.length; index++) {
            // We need a line when a face has no adjacency on a specific edge or if all the adjacencies has an angle greater than epsilon
            var current = adjacencies[index];
            this._checkEdge(index, current.edges[0], faceNormals, current.p0, current.p1);
            this._checkEdge(index, current.edges[1], faceNormals, current.p1, current.p2);
            this._checkEdge(index, current.edges[2], faceNormals, current.p2, current.p0);
        }
        // Merge into a single mesh
        var engine = this._source.getScene().getEngine();
        this._buffers[VertexBuffer.PositionKind] = new VertexBuffer(engine, this._linesPositions, VertexBuffer.PositionKind, false);
        this._buffers[VertexBuffer.NormalKind] = new VertexBuffer(engine, this._linesNormals, VertexBuffer.NormalKind, false, false, 4);
        this._buffersForInstances[VertexBuffer.PositionKind] = this._buffers[VertexBuffer.PositionKind];
        this._buffersForInstances[VertexBuffer.NormalKind] = this._buffers[VertexBuffer.NormalKind];
        this._ib = engine.createIndexBuffer(this._linesIndices);
        this._indicesCount = this._linesIndices.length;
    };
    /**
     * Checks whether or not the edges renderer is ready to render.
     * @return true if ready, otherwise false.
     */
    EdgesRenderer.prototype.isReady = function () {
        return this._lineShader.isReady(this._source, (this._source.hasInstances && this.customInstances.length > 0) || this._source.hasThinInstances);
    };
    /**
     * Renders the edges of the attached mesh,
     */
    EdgesRenderer.prototype.render = function () {
        var scene = this._source.getScene();
        var currentDrawWrapper = this._lineShader._getDrawWrapper();
        if (this._drawWrapper) {
            this._lineShader._setDrawWrapper(this._drawWrapper);
        }
        if (!this.isReady() || !scene.activeCamera) {
            this._lineShader._setDrawWrapper(currentDrawWrapper);
            return;
        }
        var hasInstances = this._source.hasInstances && this.customInstances.length > 0;
        var useBuffersWithInstances = hasInstances || this._source.hasThinInstances;
        var instanceCount = 0;
        if (useBuffersWithInstances) {
            this._buffersForInstances["world0"] = this._source.getVertexBuffer("world0");
            this._buffersForInstances["world1"] = this._source.getVertexBuffer("world1");
            this._buffersForInstances["world2"] = this._source.getVertexBuffer("world2");
            this._buffersForInstances["world3"] = this._source.getVertexBuffer("world3");
            if (hasInstances) {
                var instanceStorage = this._source._instanceDataStorage;
                instanceCount = this.customInstances.length;
                if (!instanceStorage.instancesData) {
                    if (!this._source.getScene()._activeMeshesFrozen) {
                        this.customInstances.reset();
                    }
                    return;
                }
                if (!instanceStorage.isFrozen) {
                    var offset = 0;
                    for (var i = 0; i < instanceCount; ++i) {
                        this.customInstances.data[i].copyToArray(instanceStorage.instancesData, offset);
                        offset += 16;
                    }
                    instanceStorage.instancesBuffer.updateDirectly(instanceStorage.instancesData, 0, instanceCount);
                }
            }
            else {
                instanceCount = this._source.thinInstanceCount;
            }
        }
        var engine = scene.getEngine();
        this._lineShader._preBind();
        if (this._source.edgesColor.a !== 1) {
            engine.setAlphaMode(2);
        }
        else {
            engine.setAlphaMode(0);
        }
        // VBOs
        engine.bindBuffers(useBuffersWithInstances ? this._buffersForInstances : this._buffers, this._ib, this._lineShader.getEffect());
        scene.resetCachedMaterial();
        this._lineShader.setColor4("color", this._source.edgesColor);
        if (scene.activeCamera.mode === Camera.ORTHOGRAPHIC_CAMERA) {
            this._lineShader.setFloat("width", this._source.edgesWidth / this.edgesWidthScalerForOrthographic);
        }
        else {
            this._lineShader.setFloat("width", this._source.edgesWidth / this.edgesWidthScalerForPerspective);
        }
        this._lineShader.setFloat("aspectRatio", engine.getAspectRatio(scene.activeCamera));
        this._lineShader.bind(this._source.getWorldMatrix());
        // Draw order
        engine.drawElementsType(Material.TriangleFillMode, 0, this._indicesCount, instanceCount);
        this._lineShader.unbind();
        if (useBuffersWithInstances) {
            engine.unbindInstanceAttributes();
        }
        if (!this._source.getScene()._activeMeshesFrozen) {
            this.customInstances.reset();
        }
        this._lineShader._setDrawWrapper(currentDrawWrapper);
    };
    return EdgesRenderer;
}());
export { EdgesRenderer };
/**
 * LineEdgesRenderer for LineMeshes to remove unnecessary triangulation
 */
var LineEdgesRenderer = /** @class */ (function (_super) {
    __extends(LineEdgesRenderer, _super);
    /**
     * This constructor turns off auto generating edges line in Edges Renderer to make it here.
     * @param  source LineMesh used to generate edges
     * @param  epsilon not important (specified angle for edge detection)
     * @param  checkVerticesInsteadOfIndices not important for LineMesh
     */
    function LineEdgesRenderer(source, epsilon, checkVerticesInsteadOfIndices) {
        if (epsilon === void 0) { epsilon = 0.95; }
        if (checkVerticesInsteadOfIndices === void 0) { checkVerticesInsteadOfIndices = false; }
        var _this = _super.call(this, source, epsilon, checkVerticesInsteadOfIndices, false) || this;
        _this._generateEdgesLines();
        return _this;
    }
    /**
     * Generate edges for each line in LinesMesh. Every Line should be rendered as edge.
     */
    LineEdgesRenderer.prototype._generateEdgesLines = function () {
        var positions = this._source.getVerticesData(VertexBuffer.PositionKind);
        var indices = this._source.getIndices();
        if (!indices || !positions) {
            return;
        }
        var p0 = TmpVectors.Vector3[0];
        var p1 = TmpVectors.Vector3[1];
        var len = indices.length - 1;
        for (var i = 0, offset = 0; i < len; i += 2, offset += 4) {
            Vector3.FromArrayToRef(positions, 3 * indices[i], p0);
            Vector3.FromArrayToRef(positions, 3 * indices[i + 1], p1);
            this.createLine(p0, p1, offset);
        }
        // Merge into a single mesh
        var engine = this._source.getScene().getEngine();
        this._buffers[VertexBuffer.PositionKind] = new VertexBuffer(engine, this._linesPositions, VertexBuffer.PositionKind, false);
        this._buffers[VertexBuffer.NormalKind] = new VertexBuffer(engine, this._linesNormals, VertexBuffer.NormalKind, false, false, 4);
        this._ib = engine.createIndexBuffer(this._linesIndices);
        this._indicesCount = this._linesIndices.length;
    };
    return LineEdgesRenderer;
}(EdgesRenderer));
export { LineEdgesRenderer };
//# sourceMappingURL=edgesRenderer.js.map