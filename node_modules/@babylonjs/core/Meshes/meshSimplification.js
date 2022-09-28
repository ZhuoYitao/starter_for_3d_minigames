import { Vector3 } from "../Maths/math.vector.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { SubMesh } from "../Meshes/subMesh.js";
import { Mesh } from "../Meshes/mesh.js";
import { AsyncLoop } from "../Misc/tools.js";
import { Epsilon } from "../Maths/math.constants.js";
/**
 * Class used to specify simplification options
 * @see https://doc.babylonjs.com/how_to/in-browser_mesh_simplification
 */
var SimplificationSettings = /** @class */ (function () {
    /**
     * Creates a SimplificationSettings
     * @param quality expected quality
     * @param distance distance when this optimized version should be used
     * @param optimizeMesh already optimized mesh
     */
    function SimplificationSettings(
    /** expected quality */
    quality, 
    /** distance when this optimized version should be used */
    distance, 
    /** already optimized mesh  */
    optimizeMesh) {
        this.quality = quality;
        this.distance = distance;
        this.optimizeMesh = optimizeMesh;
    }
    return SimplificationSettings;
}());
export { SimplificationSettings };
/**
 * Queue used to order the simplification tasks
 * @see https://doc.babylonjs.com/how_to/in-browser_mesh_simplification
 */
var SimplificationQueue = /** @class */ (function () {
    /**
     * Creates a new queue
     */
    function SimplificationQueue() {
        this.running = false;
        this._simplificationArray = [];
    }
    /**
     * Adds a new simplification task
     * @param task defines a task to add
     */
    SimplificationQueue.prototype.addTask = function (task) {
        this._simplificationArray.push(task);
    };
    /**
     * Execute next task
     */
    SimplificationQueue.prototype.executeNext = function () {
        var task = this._simplificationArray.pop();
        if (task) {
            this.running = true;
            this.runSimplification(task);
        }
        else {
            this.running = false;
        }
    };
    /**
     * Execute a simplification task
     * @param task defines the task to run
     */
    SimplificationQueue.prototype.runSimplification = function (task) {
        var _this = this;
        if (task.parallelProcessing) {
            //parallel simplifier
            task.settings.forEach(function (setting) {
                var simplifier = _this._getSimplifier(task);
                simplifier.simplify(setting, function (newMesh) {
                    if (setting.distance !== undefined) {
                        task.mesh.addLODLevel(setting.distance, newMesh);
                    }
                    newMesh.isVisible = true;
                    //check if it is the last
                    if (setting.quality === task.settings[task.settings.length - 1].quality && task.successCallback) {
                        //all done, run the success callback.
                        task.successCallback();
                    }
                    _this.executeNext();
                });
            });
        }
        else {
            //single simplifier.
            var simplifier_1 = this._getSimplifier(task);
            var runDecimation_1 = function (setting, callback) {
                simplifier_1.simplify(setting, function (newMesh) {
                    if (setting.distance !== undefined) {
                        task.mesh.addLODLevel(setting.distance, newMesh);
                    }
                    newMesh.isVisible = true;
                    //run the next quality level
                    callback();
                });
            };
            AsyncLoop.Run(task.settings.length, function (loop) {
                runDecimation_1(task.settings[loop.index], function () {
                    loop.executeNext();
                });
            }, function () {
                //execution ended, run the success callback.
                if (task.successCallback) {
                    task.successCallback();
                }
                _this.executeNext();
            });
        }
    };
    SimplificationQueue.prototype._getSimplifier = function (task) {
        switch (task.simplificationType) {
            case SimplificationType.QUADRATIC:
            default:
                return new QuadraticErrorSimplification(task.mesh);
        }
    };
    return SimplificationQueue;
}());
export { SimplificationQueue };
/**
 * The implemented types of simplification
 * At the moment only Quadratic Error Decimation is implemented
 * @see https://doc.babylonjs.com/how_to/in-browser_mesh_simplification
 */
export var SimplificationType;
(function (SimplificationType) {
    /** Quadratic error decimation */
    SimplificationType[SimplificationType["QUADRATIC"] = 0] = "QUADRATIC";
})(SimplificationType || (SimplificationType = {}));
var DecimationTriangle = /** @class */ (function () {
    function DecimationTriangle(_vertices) {
        this._vertices = _vertices;
        this.error = new Array(4);
        this.deleted = false;
        this.isDirty = false;
        this.deletePending = false;
        this.borderFactor = 0;
    }
    return DecimationTriangle;
}());
var DecimationVertex = /** @class */ (function () {
    function DecimationVertex(position, id) {
        this.position = position;
        this.id = id;
        this.isBorder = true;
        this.q = new QuadraticMatrix();
        this.triangleCount = 0;
        this.triangleStart = 0;
        this.originalOffsets = [];
    }
    DecimationVertex.prototype.updatePosition = function (newPosition) {
        this.position.copyFrom(newPosition);
    };
    return DecimationVertex;
}());
var QuadraticMatrix = /** @class */ (function () {
    function QuadraticMatrix(data) {
        this.data = new Array(10);
        for (var i = 0; i < 10; ++i) {
            if (data && data[i]) {
                this.data[i] = data[i];
            }
            else {
                this.data[i] = 0;
            }
        }
    }
    QuadraticMatrix.prototype.det = function (a11, a12, a13, a21, a22, a23, a31, a32, a33) {
        var det = this.data[a11] * this.data[a22] * this.data[a33] +
            this.data[a13] * this.data[a21] * this.data[a32] +
            this.data[a12] * this.data[a23] * this.data[a31] -
            this.data[a13] * this.data[a22] * this.data[a31] -
            this.data[a11] * this.data[a23] * this.data[a32] -
            this.data[a12] * this.data[a21] * this.data[a33];
        return det;
    };
    QuadraticMatrix.prototype.addInPlace = function (matrix) {
        for (var i = 0; i < 10; ++i) {
            this.data[i] += matrix.data[i];
        }
    };
    QuadraticMatrix.prototype.addArrayInPlace = function (data) {
        for (var i = 0; i < 10; ++i) {
            this.data[i] += data[i];
        }
    };
    QuadraticMatrix.prototype.add = function (matrix) {
        var m = new QuadraticMatrix();
        for (var i = 0; i < 10; ++i) {
            m.data[i] = this.data[i] + matrix.data[i];
        }
        return m;
    };
    QuadraticMatrix.FromData = function (a, b, c, d) {
        return new QuadraticMatrix(QuadraticMatrix.DataFromNumbers(a, b, c, d));
    };
    //returning an array to avoid garbage collection
    QuadraticMatrix.DataFromNumbers = function (a, b, c, d) {
        return [a * a, a * b, a * c, a * d, b * b, b * c, b * d, c * c, c * d, d * d];
    };
    return QuadraticMatrix;
}());
var Reference = /** @class */ (function () {
    function Reference(vertexId, triangleId) {
        this.vertexId = vertexId;
        this.triangleId = triangleId;
    }
    return Reference;
}());
/**
 * An implementation of the Quadratic Error simplification algorithm.
 * Original paper : http://www1.cs.columbia.edu/~cs4162/html05s/garland97.pdf
 * Ported mostly from QSlim and http://voxels.blogspot.de/2014/05/quadric-mesh-simplification-with-source.html to babylon JS
 * @author RaananW
 * @see https://doc.babylonjs.com/how_to/in-browser_mesh_simplification
 */
var QuadraticErrorSimplification = /** @class */ (function () {
    /**
     * Creates a new QuadraticErrorSimplification
     * @param _mesh defines the target mesh
     */
    function QuadraticErrorSimplification(_mesh) {
        this._mesh = _mesh;
        /** Gets or sets the number pf sync iterations */
        this.syncIterations = 5000;
        this.aggressiveness = 7;
        this.decimationIterations = 100;
        this.boundingBoxEpsilon = Epsilon;
    }
    /**
     * Simplification of a given mesh according to the given settings.
     * Since this requires computation, it is assumed that the function runs async.
     * @param settings The settings of the simplification, including quality and distance
     * @param successCallback A callback that will be called after the mesh was simplified.
     */
    QuadraticErrorSimplification.prototype.simplify = function (settings, successCallback) {
        var _this = this;
        this._initDecimatedMesh();
        //iterating through the submeshes array, one after the other.
        AsyncLoop.Run(this._mesh.subMeshes.length, function (loop) {
            _this._initWithMesh(loop.index, function () {
                _this._runDecimation(settings, loop.index, function () {
                    loop.executeNext();
                });
            }, settings.optimizeMesh);
        }, function () {
            setTimeout(function () {
                successCallback(_this._reconstructedMesh);
            }, 0);
        });
    };
    QuadraticErrorSimplification.prototype._runDecimation = function (settings, submeshIndex, successCallback) {
        var _this = this;
        var targetCount = ~~(this._triangles.length * settings.quality);
        var deletedTriangles = 0;
        var triangleCount = this._triangles.length;
        var iterationFunction = function (iteration, callback) {
            setTimeout(function () {
                if (iteration % 5 === 0) {
                    _this._updateMesh(iteration === 0);
                }
                for (var i = 0; i < _this._triangles.length; ++i) {
                    _this._triangles[i].isDirty = false;
                }
                var threshold = 0.000000001 * Math.pow(iteration + 3, _this.aggressiveness);
                var trianglesIterator = function (i) {
                    var tIdx = ~~((_this._triangles.length / 2 + i) % _this._triangles.length);
                    var t = _this._triangles[tIdx];
                    if (!t) {
                        return;
                    }
                    if (t.error[3] > threshold || t.deleted || t.isDirty) {
                        return;
                    }
                    var _loop_1 = function (j) {
                        if (t.error[j] < threshold) {
                            var deleted0 = [];
                            var deleted1 = [];
                            var v0 = t._vertices[j];
                            var v1 = t._vertices[(j + 1) % 3];
                            if (v0.isBorder || v1.isBorder) {
                                return "continue";
                            }
                            var p = Vector3.Zero();
                            // var n = Vector3.Zero();
                            // var uv = Vector2.Zero();
                            // var color = new Color4(0, 0, 0, 1);
                            _this._calculateError(v0, v1, p);
                            var delTr = new Array();
                            if (_this._isFlipped(v0, v1, p, deleted0, delTr)) {
                                return "continue";
                            }
                            if (_this._isFlipped(v1, v0, p, deleted1, delTr)) {
                                return "continue";
                            }
                            if (deleted0.indexOf(true) < 0 || deleted1.indexOf(true) < 0) {
                                return "continue";
                            }
                            var uniqueArray_1 = new Array();
                            delTr.forEach(function (deletedT) {
                                if (uniqueArray_1.indexOf(deletedT) === -1) {
                                    deletedT.deletePending = true;
                                    uniqueArray_1.push(deletedT);
                                }
                            });
                            if (uniqueArray_1.length % 2 !== 0) {
                                return "continue";
                            }
                            v0.q = v1.q.add(v0.q);
                            v0.updatePosition(p);
                            var tStart = _this._references.length;
                            deletedTriangles = _this._updateTriangles(v0, v0, deleted0, deletedTriangles);
                            deletedTriangles = _this._updateTriangles(v0, v1, deleted1, deletedTriangles);
                            var tCount = _this._references.length - tStart;
                            if (tCount <= v0.triangleCount) {
                                if (tCount) {
                                    for (var c = 0; c < tCount; c++) {
                                        _this._references[v0.triangleStart + c] = _this._references[tStart + c];
                                    }
                                }
                            }
                            else {
                                v0.triangleStart = tStart;
                            }
                            v0.triangleCount = tCount;
                            return "break";
                        }
                    };
                    for (var j = 0; j < 3; ++j) {
                        var state_1 = _loop_1(j);
                        if (state_1 === "break")
                            break;
                    }
                };
                AsyncLoop.SyncAsyncForLoop(_this._triangles.length, _this.syncIterations, trianglesIterator, callback, function () {
                    return triangleCount - deletedTriangles <= targetCount;
                });
            }, 0);
        };
        AsyncLoop.Run(this.decimationIterations, function (loop) {
            if (triangleCount - deletedTriangles <= targetCount) {
                loop.breakLoop();
            }
            else {
                iterationFunction(loop.index, function () {
                    loop.executeNext();
                });
            }
        }, function () {
            setTimeout(function () {
                //reconstruct this part of the mesh
                _this._reconstructMesh(submeshIndex);
                successCallback();
            }, 0);
        });
    };
    QuadraticErrorSimplification.prototype._initWithMesh = function (submeshIndex, callback, optimizeMesh) {
        var _this = this;
        this._vertices = [];
        this._triangles = [];
        var positionData = this._mesh.getVerticesData(VertexBuffer.PositionKind);
        var indices = this._mesh.getIndices();
        var submesh = this._mesh.subMeshes[submeshIndex];
        var findInVertices = function (positionToSearch) {
            if (optimizeMesh) {
                for (var ii = 0; ii < _this._vertices.length; ++ii) {
                    if (_this._vertices[ii].position.equalsWithEpsilon(positionToSearch, 0.0001)) {
                        return _this._vertices[ii];
                    }
                }
            }
            return null;
        };
        var vertexReferences = [];
        var vertexInit = function (i) {
            if (!positionData) {
                return;
            }
            var offset = i + submesh.verticesStart;
            var position = Vector3.FromArray(positionData, offset * 3);
            var vertex = findInVertices(position) || new DecimationVertex(position, _this._vertices.length);
            vertex.originalOffsets.push(offset);
            if (vertex.id === _this._vertices.length) {
                _this._vertices.push(vertex);
            }
            vertexReferences.push(vertex.id);
        };
        //var totalVertices = mesh.getTotalVertices();
        var totalVertices = submesh.verticesCount;
        AsyncLoop.SyncAsyncForLoop(totalVertices, (this.syncIterations / 4) >> 0, vertexInit, function () {
            var indicesInit = function (i) {
                if (!indices) {
                    return;
                }
                var offset = submesh.indexStart / 3 + i;
                var pos = offset * 3;
                var i0 = indices[pos + 0];
                var i1 = indices[pos + 1];
                var i2 = indices[pos + 2];
                var v0 = _this._vertices[vertexReferences[i0 - submesh.verticesStart]];
                var v1 = _this._vertices[vertexReferences[i1 - submesh.verticesStart]];
                var v2 = _this._vertices[vertexReferences[i2 - submesh.verticesStart]];
                var triangle = new DecimationTriangle([v0, v1, v2]);
                triangle.originalOffset = pos;
                _this._triangles.push(triangle);
            };
            AsyncLoop.SyncAsyncForLoop(submesh.indexCount / 3, _this.syncIterations, indicesInit, function () {
                _this._init(callback);
            });
        });
    };
    QuadraticErrorSimplification.prototype._init = function (callback) {
        var _this = this;
        var triangleInit1 = function (i) {
            var t = _this._triangles[i];
            t.normal = Vector3.Cross(t._vertices[1].position.subtract(t._vertices[0].position), t._vertices[2].position.subtract(t._vertices[0].position)).normalize();
            for (var j = 0; j < 3; j++) {
                t._vertices[j].q.addArrayInPlace(QuadraticMatrix.DataFromNumbers(t.normal.x, t.normal.y, t.normal.z, -Vector3.Dot(t.normal, t._vertices[0].position)));
            }
        };
        AsyncLoop.SyncAsyncForLoop(this._triangles.length, this.syncIterations, triangleInit1, function () {
            var triangleInit2 = function (i) {
                var t = _this._triangles[i];
                for (var j = 0; j < 3; ++j) {
                    t.error[j] = _this._calculateError(t._vertices[j], t._vertices[(j + 1) % 3]);
                }
                t.error[3] = Math.min(t.error[0], t.error[1], t.error[2]);
            };
            AsyncLoop.SyncAsyncForLoop(_this._triangles.length, _this.syncIterations, triangleInit2, function () {
                callback();
            });
        });
    };
    QuadraticErrorSimplification.prototype._reconstructMesh = function (submeshIndex) {
        var newTriangles = [];
        var i;
        for (i = 0; i < this._vertices.length; ++i) {
            this._vertices[i].triangleCount = 0;
        }
        var t;
        var j;
        for (i = 0; i < this._triangles.length; ++i) {
            if (!this._triangles[i].deleted) {
                t = this._triangles[i];
                for (j = 0; j < 3; ++j) {
                    t._vertices[j].triangleCount = 1;
                }
                newTriangles.push(t);
            }
        }
        var newPositionData = (this._reconstructedMesh.getVerticesData(VertexBuffer.PositionKind) || []);
        var newNormalData = (this._reconstructedMesh.getVerticesData(VertexBuffer.NormalKind) || []);
        var newUVsData = (this._reconstructedMesh.getVerticesData(VertexBuffer.UVKind) || []);
        var newColorsData = (this._reconstructedMesh.getVerticesData(VertexBuffer.ColorKind) || []);
        var normalData = this._mesh.getVerticesData(VertexBuffer.NormalKind);
        var uvs = this._mesh.getVerticesData(VertexBuffer.UVKind);
        var colorsData = this._mesh.getVerticesData(VertexBuffer.ColorKind);
        var vertexCount = 0;
        var _loop_2 = function () {
            var vertex = this_1._vertices[i];
            vertex.id = vertexCount;
            if (vertex.triangleCount) {
                vertex.originalOffsets.forEach(function (originalOffset) {
                    newPositionData.push(vertex.position.x);
                    newPositionData.push(vertex.position.y);
                    newPositionData.push(vertex.position.z);
                    if (normalData && normalData.length) {
                        newNormalData.push(normalData[originalOffset * 3]);
                        newNormalData.push(normalData[originalOffset * 3 + 1]);
                        newNormalData.push(normalData[originalOffset * 3 + 2]);
                    }
                    if (uvs && uvs.length) {
                        newUVsData.push(uvs[originalOffset * 2]);
                        newUVsData.push(uvs[originalOffset * 2 + 1]);
                    }
                    if (colorsData && colorsData.length) {
                        newColorsData.push(colorsData[originalOffset * 4]);
                        newColorsData.push(colorsData[originalOffset * 4 + 1]);
                        newColorsData.push(colorsData[originalOffset * 4 + 2]);
                        newColorsData.push(colorsData[originalOffset * 4 + 3]);
                    }
                    ++vertexCount;
                });
            }
        };
        var this_1 = this;
        for (i = 0; i < this._vertices.length; ++i) {
            _loop_2();
        }
        var startingIndex = this._reconstructedMesh.getTotalIndices();
        var startingVertex = this._reconstructedMesh.getTotalVertices();
        var submeshesArray = this._reconstructedMesh.subMeshes;
        this._reconstructedMesh.subMeshes = [];
        var newIndicesArray = this._reconstructedMesh.getIndices(); //[];
        var originalIndices = this._mesh.getIndices();
        for (i = 0; i < newTriangles.length; ++i) {
            t = newTriangles[i]; //now get the new referencing point for each vertex
            [0, 1, 2].forEach(function (idx) {
                var id = originalIndices[t.originalOffset + idx];
                var offset = t._vertices[idx].originalOffsets.indexOf(id);
                if (offset < 0) {
                    offset = 0;
                }
                newIndicesArray.push(t._vertices[idx].id + offset + startingVertex);
            });
        }
        //overwriting the old vertex buffers and indices.
        this._reconstructedMesh.setIndices(newIndicesArray);
        this._reconstructedMesh.setVerticesData(VertexBuffer.PositionKind, newPositionData);
        if (newNormalData.length > 0) {
            this._reconstructedMesh.setVerticesData(VertexBuffer.NormalKind, newNormalData);
        }
        if (newUVsData.length > 0) {
            this._reconstructedMesh.setVerticesData(VertexBuffer.UVKind, newUVsData);
        }
        if (newColorsData.length > 0) {
            this._reconstructedMesh.setVerticesData(VertexBuffer.ColorKind, newColorsData);
        }
        //create submesh
        var originalSubmesh = this._mesh.subMeshes[submeshIndex];
        if (submeshIndex > 0) {
            this._reconstructedMesh.subMeshes = [];
            submeshesArray.forEach(function (submesh) {
                SubMesh.AddToMesh(submesh.materialIndex, submesh.verticesStart, submesh.verticesCount, 
                /* 0, newPositionData.length/3, */ submesh.indexStart, submesh.indexCount, submesh.getMesh());
            });
            SubMesh.AddToMesh(originalSubmesh.materialIndex, startingVertex, vertexCount, 
            /* 0, newPositionData.length / 3, */ startingIndex, newTriangles.length * 3, this._reconstructedMesh);
        }
    };
    QuadraticErrorSimplification.prototype._initDecimatedMesh = function () {
        this._reconstructedMesh = new Mesh(this._mesh.name + "Decimated", this._mesh.getScene());
        this._reconstructedMesh.material = this._mesh.material;
        this._reconstructedMesh.parent = this._mesh.parent;
        this._reconstructedMesh.isVisible = false;
        this._reconstructedMesh.renderingGroupId = this._mesh.renderingGroupId;
    };
    QuadraticErrorSimplification.prototype._isFlipped = function (vertex1, vertex2, point, deletedArray, delTr) {
        for (var i = 0; i < vertex1.triangleCount; ++i) {
            var t = this._triangles[this._references[vertex1.triangleStart + i].triangleId];
            if (t.deleted) {
                continue;
            }
            var s = this._references[vertex1.triangleStart + i].vertexId;
            var v1 = t._vertices[(s + 1) % 3];
            var v2 = t._vertices[(s + 2) % 3];
            if (v1 === vertex2 || v2 === vertex2) {
                deletedArray[i] = true;
                delTr.push(t);
                continue;
            }
            var d1 = v1.position.subtract(point);
            d1 = d1.normalize();
            var d2 = v2.position.subtract(point);
            d2 = d2.normalize();
            if (Math.abs(Vector3.Dot(d1, d2)) > 0.999) {
                return true;
            }
            var normal = Vector3.Cross(d1, d2).normalize();
            deletedArray[i] = false;
            if (Vector3.Dot(normal, t.normal) < 0.2) {
                return true;
            }
        }
        return false;
    };
    QuadraticErrorSimplification.prototype._updateTriangles = function (origVertex, vertex, deletedArray, deletedTriangles) {
        var newDeleted = deletedTriangles;
        for (var i = 0; i < vertex.triangleCount; ++i) {
            var ref = this._references[vertex.triangleStart + i];
            var t = this._triangles[ref.triangleId];
            if (t.deleted) {
                continue;
            }
            if (deletedArray[i] && t.deletePending) {
                t.deleted = true;
                newDeleted++;
                continue;
            }
            t._vertices[ref.vertexId] = origVertex;
            t.isDirty = true;
            t.error[0] = this._calculateError(t._vertices[0], t._vertices[1]) + t.borderFactor / 2;
            t.error[1] = this._calculateError(t._vertices[1], t._vertices[2]) + t.borderFactor / 2;
            t.error[2] = this._calculateError(t._vertices[2], t._vertices[0]) + t.borderFactor / 2;
            t.error[3] = Math.min(t.error[0], t.error[1], t.error[2]);
            this._references.push(ref);
        }
        return newDeleted;
    };
    QuadraticErrorSimplification.prototype._identifyBorder = function () {
        for (var i = 0; i < this._vertices.length; ++i) {
            var vCount = [];
            var vId = [];
            var v = this._vertices[i];
            var j = void 0;
            for (j = 0; j < v.triangleCount; ++j) {
                var triangle = this._triangles[this._references[v.triangleStart + j].triangleId];
                for (var ii = 0; ii < 3; ii++) {
                    var ofs = 0;
                    var vv = triangle._vertices[ii];
                    while (ofs < vCount.length) {
                        if (vId[ofs] === vv.id) {
                            break;
                        }
                        ++ofs;
                    }
                    if (ofs === vCount.length) {
                        vCount.push(1);
                        vId.push(vv.id);
                    }
                    else {
                        vCount[ofs]++;
                    }
                }
            }
            for (j = 0; j < vCount.length; ++j) {
                if (vCount[j] === 1) {
                    this._vertices[vId[j]].isBorder = true;
                }
                else {
                    this._vertices[vId[j]].isBorder = false;
                }
            }
        }
    };
    QuadraticErrorSimplification.prototype._updateMesh = function (identifyBorders) {
        if (identifyBorders === void 0) { identifyBorders = false; }
        var i;
        if (!identifyBorders) {
            var newTrianglesVector = [];
            for (i = 0; i < this._triangles.length; ++i) {
                if (!this._triangles[i].deleted) {
                    newTrianglesVector.push(this._triangles[i]);
                }
            }
            this._triangles = newTrianglesVector;
        }
        for (i = 0; i < this._vertices.length; ++i) {
            this._vertices[i].triangleCount = 0;
            this._vertices[i].triangleStart = 0;
        }
        var t;
        var j;
        var v;
        for (i = 0; i < this._triangles.length; ++i) {
            t = this._triangles[i];
            for (j = 0; j < 3; ++j) {
                v = t._vertices[j];
                v.triangleCount++;
            }
        }
        var tStart = 0;
        for (i = 0; i < this._vertices.length; ++i) {
            this._vertices[i].triangleStart = tStart;
            tStart += this._vertices[i].triangleCount;
            this._vertices[i].triangleCount = 0;
        }
        var newReferences = new Array(this._triangles.length * 3);
        for (i = 0; i < this._triangles.length; ++i) {
            t = this._triangles[i];
            for (j = 0; j < 3; ++j) {
                v = t._vertices[j];
                newReferences[v.triangleStart + v.triangleCount] = new Reference(j, i);
                v.triangleCount++;
            }
        }
        this._references = newReferences;
        if (identifyBorders) {
            this._identifyBorder();
        }
    };
    QuadraticErrorSimplification.prototype._vertexError = function (q, point) {
        var x = point.x;
        var y = point.y;
        var z = point.z;
        return (q.data[0] * x * x +
            2 * q.data[1] * x * y +
            2 * q.data[2] * x * z +
            2 * q.data[3] * x +
            q.data[4] * y * y +
            2 * q.data[5] * y * z +
            2 * q.data[6] * y +
            q.data[7] * z * z +
            2 * q.data[8] * z +
            q.data[9]);
    };
    QuadraticErrorSimplification.prototype._calculateError = function (vertex1, vertex2, pointResult) {
        var q = vertex1.q.add(vertex2.q);
        var border = vertex1.isBorder && vertex2.isBorder;
        var error = 0;
        var qDet = q.det(0, 1, 2, 1, 4, 5, 2, 5, 7);
        if (qDet !== 0 && !border) {
            if (!pointResult) {
                pointResult = Vector3.Zero();
            }
            pointResult.x = (-1 / qDet) * q.det(1, 2, 3, 4, 5, 6, 5, 7, 8);
            pointResult.y = (1 / qDet) * q.det(0, 2, 3, 1, 5, 6, 2, 7, 8);
            pointResult.z = (-1 / qDet) * q.det(0, 1, 3, 1, 4, 6, 2, 5, 8);
            error = this._vertexError(q, pointResult);
        }
        else {
            var p3 = vertex1.position.add(vertex2.position).divide(new Vector3(2, 2, 2));
            //var norm3 = (vertex1.normal.add(vertex2.normal)).divide(new Vector3(2, 2, 2)).normalize();
            var error1 = this._vertexError(q, vertex1.position);
            var error2 = this._vertexError(q, vertex2.position);
            var error3 = this._vertexError(q, p3);
            error = Math.min(error1, error2, error3);
            if (error === error1) {
                if (pointResult) {
                    pointResult.copyFrom(vertex1.position);
                }
            }
            else if (error === error2) {
                if (pointResult) {
                    pointResult.copyFrom(vertex2.position);
                }
            }
            else {
                if (pointResult) {
                    pointResult.copyFrom(p3);
                }
            }
        }
        return error;
    };
    return QuadraticErrorSimplification;
}());
export { QuadraticErrorSimplification };
//# sourceMappingURL=meshSimplification.js.map