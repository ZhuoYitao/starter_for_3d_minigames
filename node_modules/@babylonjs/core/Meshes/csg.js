import { Quaternion, Matrix, Vector3, Vector2 } from "../Maths/math.vector.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { SubMesh } from "../Meshes/subMesh.js";
import { Mesh } from "../Meshes/mesh.js";
import { Color4 } from "../Maths/math.color.js";

/**
 * Unique ID when we import meshes from Babylon to CSG
 */
var currentCSGMeshId = 0;
/**
 * Represents a vertex of a polygon. Use your own vertex class instead of this
 * one to provide additional features like texture coordinates and vertex
 * colors. Custom vertex classes need to provide a `pos` property and `clone()`,
 * `flip()`, and `interpolate()` methods that behave analogous to the ones
 * defined by `BABYLON.CSG.Vertex`. This class provides `normal` so convenience
 * functions like `BABYLON.CSG.sphere()` can return a smooth vertex normal, but `normal`
 * is not used anywhere else.
 * Same goes for uv, it allows to keep the original vertex uv coordinates of the 2 meshes
 */
var Vertex = /** @class */ (function () {
    /**
     * Initializes the vertex
     * @param pos The position of the vertex
     * @param normal The normal of the vertex
     * @param uv The texture coordinate of the vertex
     * @param vertColor The RGBA color of the vertex
     */
    function Vertex(
    /**
     * The position of the vertex
     */
    pos, 
    /**
     * The normal of the vertex
     */
    normal, 
    /**
     * The texture coordinate of the vertex
     */
    uv, 
    /**
     * The texture coordinate of the vertex
     */
    vertColor) {
        this.pos = pos;
        this.normal = normal;
        this.uv = uv;
        this.vertColor = vertColor;
    }
    /**
     * Make a clone, or deep copy, of the vertex
     * @returns A new Vertex
     */
    Vertex.prototype.clone = function () {
        var _a, _b;
        return new Vertex(this.pos.clone(), this.normal.clone(), (_a = this.uv) === null || _a === void 0 ? void 0 : _a.clone(), (_b = this.vertColor) === null || _b === void 0 ? void 0 : _b.clone());
    };
    /**
     * Invert all orientation-specific data (e.g. vertex normal). Called when the
     * orientation of a polygon is flipped.
     */
    Vertex.prototype.flip = function () {
        this.normal = this.normal.scale(-1);
    };
    /**
     * Create a new vertex between this vertex and `other` by linearly
     * interpolating all properties using a parameter of `t`. Subclasses should
     * override this to interpolate additional properties.
     * @param other the vertex to interpolate against
     * @param t The factor used to linearly interpolate between the vertices
     */
    Vertex.prototype.interpolate = function (other, t) {
        return new Vertex(Vector3.Lerp(this.pos, other.pos, t), Vector3.Lerp(this.normal, other.normal, t), this.uv && other.uv ? Vector2.Lerp(this.uv, other.uv, t) : undefined, this.vertColor && other.vertColor ? Color4.Lerp(this.vertColor, other.vertColor, t) : undefined);
    };
    return Vertex;
}());
/**
 * Represents a plane in 3D space.
 */
var Plane = /** @class */ (function () {
    /**
     * Initializes the plane
     * @param normal The normal for the plane
     * @param w
     */
    function Plane(normal, w) {
        this.normal = normal;
        this.w = w;
    }
    /**
     * Construct a plane from three points
     * @param a Point a
     * @param b Point b
     * @param c Point c
     */
    Plane.FromPoints = function (a, b, c) {
        var v0 = c.subtract(a);
        var v1 = b.subtract(a);
        if (v0.lengthSquared() === 0 || v1.lengthSquared() === 0) {
            return null;
        }
        var n = Vector3.Normalize(Vector3.Cross(v0, v1));
        return new Plane(n, Vector3.Dot(n, a));
    };
    /**
     * Clone, or make a deep copy of the plane
     * @returns a new Plane
     */
    Plane.prototype.clone = function () {
        return new Plane(this.normal.clone(), this.w);
    };
    /**
     * Flip the face of the plane
     */
    Plane.prototype.flip = function () {
        this.normal.scaleInPlace(-1);
        this.w = -this.w;
    };
    /**
     * Split `polygon` by this plane if needed, then put the polygon or polygon
     * fragments in the appropriate lists. Coplanar polygons go into either
    `* coplanarFront` or `coplanarBack` depending on their orientation with
     * respect to this plane. Polygons in front or in back of this plane go into
     * either `front` or `back`
     * @param polygon The polygon to be split
     * @param coplanarFront Will contain polygons coplanar with the plane that are oriented to the front of the plane
     * @param coplanarBack Will contain polygons coplanar with the plane that are oriented to the back of the plane
     * @param front Will contain the polygons in front of the plane
     * @param back Will contain the polygons begind the plane
     */
    Plane.prototype.splitPolygon = function (polygon, coplanarFront, coplanarBack, front, back) {
        var COPLANAR = 0;
        var FRONT = 1;
        var BACK = 2;
        var SPANNING = 3;
        // Classify each point as well as the entire polygon into one of the above
        // four classes.
        var polygonType = 0;
        var types = [];
        var i;
        var t;
        for (i = 0; i < polygon.vertices.length; i++) {
            t = Vector3.Dot(this.normal, polygon.vertices[i].pos) - this.w;
            var type = t < -Plane.EPSILON ? BACK : t > Plane.EPSILON ? FRONT : COPLANAR;
            polygonType |= type;
            types.push(type);
        }
        // Put the polygon in the correct list, splitting it when necessary
        switch (polygonType) {
            case COPLANAR:
                (Vector3.Dot(this.normal, polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
                break;
            case FRONT:
                front.push(polygon);
                break;
            case BACK:
                back.push(polygon);
                break;
            case SPANNING: {
                var f = [], b = [];
                for (i = 0; i < polygon.vertices.length; i++) {
                    var j = (i + 1) % polygon.vertices.length;
                    var ti = types[i], tj = types[j];
                    var vi = polygon.vertices[i], vj = polygon.vertices[j];
                    if (ti !== BACK) {
                        f.push(vi);
                    }
                    if (ti !== FRONT) {
                        b.push(ti !== BACK ? vi.clone() : vi);
                    }
                    if ((ti | tj) === SPANNING) {
                        t = (this.w - Vector3.Dot(this.normal, vi.pos)) / Vector3.Dot(this.normal, vj.pos.subtract(vi.pos));
                        var v = vi.interpolate(vj, t);
                        f.push(v);
                        b.push(v.clone());
                    }
                }
                var poly = void 0;
                if (f.length >= 3) {
                    poly = new Polygon(f, polygon.shared);
                    if (poly.plane) {
                        front.push(poly);
                    }
                }
                if (b.length >= 3) {
                    poly = new Polygon(b, polygon.shared);
                    if (poly.plane) {
                        back.push(poly);
                    }
                }
                break;
            }
        }
    };
    /**
     * `CSG.Plane.EPSILON` is the tolerance used by `splitPolygon()` to decide if a
     * point is on the plane
     */
    Plane.EPSILON = 1e-5;
    return Plane;
}());
/**
 * Represents a convex polygon. The vertices used to initialize a polygon must
 * be coplanar and form a convex loop.
 *
 * Each convex polygon has a `shared` property, which is shared between all
 * polygons that are clones of each other or were split from the same polygon.
 * This can be used to define per-polygon properties (such as surface color)
 */
var Polygon = /** @class */ (function () {
    /**
     * Initializes the polygon
     * @param vertices The vertices of the polygon
     * @param shared The properties shared across all polygons
     */
    function Polygon(vertices, shared) {
        this.vertices = vertices;
        this.shared = shared;
        this.plane = Plane.FromPoints(vertices[0].pos, vertices[1].pos, vertices[2].pos);
    }
    /**
     * Clones, or makes a deep copy, or the polygon
     */
    Polygon.prototype.clone = function () {
        var vertices = this.vertices.map(function (v) { return v.clone(); });
        return new Polygon(vertices, this.shared);
    };
    /**
     * Flips the faces of the polygon
     */
    Polygon.prototype.flip = function () {
        this.vertices.reverse().map(function (v) {
            v.flip();
        });
        this.plane.flip();
    };
    return Polygon;
}());
/**
 * Holds a node in a BSP tree. A BSP tree is built from a collection of polygons
 * by picking a polygon to split along. That polygon (and all other coplanar
 * polygons) are added directly to that node and the other polygons are added to
 * the front and/or back subtrees. This is not a leafy BSP tree since there is
 * no distinction between internal and leaf nodes
 */
var Node = /** @class */ (function () {
    /**
     * Initializes the node
     * @param polygons A collection of polygons held in the node
     */
    function Node(polygons) {
        this._plane = null;
        this._front = null;
        this._back = null;
        this._polygons = new Array();
        if (polygons) {
            this.build(polygons);
        }
    }
    /**
     * Clones, or makes a deep copy, of the node
     * @returns The cloned node
     */
    Node.prototype.clone = function () {
        var node = new Node();
        node._plane = this._plane && this._plane.clone();
        node._front = this._front && this._front.clone();
        node._back = this._back && this._back.clone();
        node._polygons = this._polygons.map(function (p) { return p.clone(); });
        return node;
    };
    /**
     * Convert solid space to empty space and empty space to solid space
     */
    Node.prototype.invert = function () {
        for (var i = 0; i < this._polygons.length; i++) {
            this._polygons[i].flip();
        }
        if (this._plane) {
            this._plane.flip();
        }
        if (this._front) {
            this._front.invert();
        }
        if (this._back) {
            this._back.invert();
        }
        var temp = this._front;
        this._front = this._back;
        this._back = temp;
    };
    /**
     * Recursively remove all polygons in `polygons` that are inside this BSP
     * tree.
     * @param polygons Polygons to remove from the BSP
     * @returns Polygons clipped from the BSP
     */
    Node.prototype.clipPolygons = function (polygons) {
        if (!this._plane) {
            return polygons.slice();
        }
        var front = new Array(), back = new Array();
        for (var i = 0; i < polygons.length; i++) {
            this._plane.splitPolygon(polygons[i], front, back, front, back);
        }
        if (this._front) {
            front = this._front.clipPolygons(front);
        }
        if (this._back) {
            back = this._back.clipPolygons(back);
        }
        else {
            back = [];
        }
        return front.concat(back);
    };
    /**
     * Remove all polygons in this BSP tree that are inside the other BSP tree
     * `bsp`.
     * @param bsp BSP containing polygons to remove from this BSP
     */
    Node.prototype.clipTo = function (bsp) {
        this._polygons = bsp.clipPolygons(this._polygons);
        if (this._front) {
            this._front.clipTo(bsp);
        }
        if (this._back) {
            this._back.clipTo(bsp);
        }
    };
    /**
     * Return a list of all polygons in this BSP tree
     * @returns List of all polygons in this BSP tree
     */
    Node.prototype.allPolygons = function () {
        var polygons = this._polygons.slice();
        if (this._front) {
            polygons = polygons.concat(this._front.allPolygons());
        }
        if (this._back) {
            polygons = polygons.concat(this._back.allPolygons());
        }
        return polygons;
    };
    /**
     * Build a BSP tree out of `polygons`. When called on an existing tree, the
     * new polygons are filtered down to the bottom of the tree and become new
     * nodes there. Each set of polygons is partitioned using the first polygon
     * (no heuristic is used to pick a good split)
     * @param polygons Polygons used to construct the BSP tree
     */
    Node.prototype.build = function (polygons) {
        if (!polygons.length) {
            return;
        }
        if (!this._plane) {
            this._plane = polygons[0].plane.clone();
        }
        var front = new Array(), back = new Array();
        for (var i = 0; i < polygons.length; i++) {
            this._plane.splitPolygon(polygons[i], this._polygons, this._polygons, front, back);
        }
        if (front.length) {
            if (!this._front) {
                this._front = new Node();
            }
            this._front.build(front);
        }
        if (back.length) {
            if (!this._back) {
                this._back = new Node();
            }
            this._back.build(back);
        }
    };
    return Node;
}());
/**
 * Class for building Constructive Solid Geometry
 */
var CSG = /** @class */ (function () {
    function CSG() {
        this._polygons = new Array();
    }
    /**
     * Convert the Mesh to CSG
     * @param mesh The Mesh to convert to CSG
     * @param absolute If true, the final (local) matrix transformation is set to the identity and not to that of `mesh`. It can help when dealing with right-handed meshes (default: false)
     * @returns A new CSG from the Mesh
     */
    CSG.FromMesh = function (mesh, absolute) {
        if (absolute === void 0) { absolute = false; }
        var vertex, normal, uv = undefined, position, vertColor = undefined, polygon, vertices;
        var polygons = new Array();
        var matrix, meshPosition, meshRotation, meshRotationQuaternion = null, meshScaling;
        var invertWinding = false;
        if (mesh instanceof Mesh) {
            mesh.computeWorldMatrix(true);
            matrix = mesh.getWorldMatrix();
            meshPosition = mesh.position.clone();
            meshRotation = mesh.rotation.clone();
            if (mesh.rotationQuaternion) {
                meshRotationQuaternion = mesh.rotationQuaternion.clone();
            }
            meshScaling = mesh.scaling.clone();
            if (mesh.material && absolute) {
                invertWinding = mesh.material.sideOrientation === 0;
            }
        }
        else {
            throw "BABYLON.CSG: Wrong Mesh type, must be BABYLON.Mesh";
        }
        var indices = mesh.getIndices(), positions = mesh.getVerticesData(VertexBuffer.PositionKind), normals = mesh.getVerticesData(VertexBuffer.NormalKind), uvs = mesh.getVerticesData(VertexBuffer.UVKind), vertColors = mesh.getVerticesData(VertexBuffer.ColorKind);
        var subMeshes = mesh.subMeshes;
        for (var sm = 0, sml = subMeshes.length; sm < sml; sm++) {
            for (var i = subMeshes[sm].indexStart, il = subMeshes[sm].indexCount + subMeshes[sm].indexStart; i < il; i += 3) {
                vertices = [];
                for (var j = 0; j < 3; j++) {
                    var indexIndices = j === 0 ? i + j : invertWinding ? i + 3 - j : i + j;
                    var sourceNormal = new Vector3(normals[indices[indexIndices] * 3], normals[indices[indexIndices] * 3 + 1], normals[indices[indexIndices] * 3 + 2]);
                    if (uvs) {
                        uv = new Vector2(uvs[indices[indexIndices] * 2], uvs[indices[indexIndices] * 2 + 1]);
                    }
                    if (vertColors) {
                        vertColor = new Color4(vertColors[indices[indexIndices] * 4], vertColors[indices[indexIndices] * 4 + 1], vertColors[indices[indexIndices] * 4 + 2], vertColors[indices[indexIndices] * 4 + 3]);
                    }
                    var sourcePosition = new Vector3(positions[indices[indexIndices] * 3], positions[indices[indexIndices] * 3 + 1], positions[indices[indexIndices] * 3 + 2]);
                    position = Vector3.TransformCoordinates(sourcePosition, matrix);
                    normal = Vector3.TransformNormal(sourceNormal, matrix);
                    vertex = new Vertex(position, normal, uv, vertColor);
                    vertices.push(vertex);
                }
                polygon = new Polygon(vertices, { subMeshId: sm, meshId: currentCSGMeshId, materialIndex: subMeshes[sm].materialIndex });
                // To handle the case of degenerated triangle
                // polygon.plane == null <=> the polygon does not represent 1 single plane <=> the triangle is degenerated
                if (polygon.plane) {
                    polygons.push(polygon);
                }
            }
        }
        var csg = CSG._FromPolygons(polygons);
        csg.matrix = absolute ? Matrix.Identity() : matrix;
        csg.position = absolute ? Vector3.Zero() : meshPosition;
        csg.rotation = absolute ? Vector3.Zero() : meshRotation;
        csg.scaling = absolute ? Vector3.One() : meshScaling;
        csg.rotationQuaternion = absolute && meshRotationQuaternion ? Quaternion.Identity() : meshRotationQuaternion;
        currentCSGMeshId++;
        return csg;
    };
    /**
     * Construct a CSG solid from a list of `CSG.Polygon` instances.
     * @param polygons Polygons used to construct a CSG solid
     */
    CSG._FromPolygons = function (polygons) {
        var csg = new CSG();
        csg._polygons = polygons;
        return csg;
    };
    /**
     * Clones, or makes a deep copy, of the CSG
     * @returns A new CSG
     */
    CSG.prototype.clone = function () {
        var csg = new CSG();
        csg._polygons = this._polygons.map(function (p) { return p.clone(); });
        csg.copyTransformAttributes(this);
        return csg;
    };
    /**
     * Unions this CSG with another CSG
     * @param csg The CSG to union against this CSG
     * @returns The unioned CSG
     */
    CSG.prototype.union = function (csg) {
        var a = new Node(this.clone()._polygons);
        var b = new Node(csg.clone()._polygons);
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        return CSG._FromPolygons(a.allPolygons()).copyTransformAttributes(this);
    };
    /**
     * Unions this CSG with another CSG in place
     * @param csg The CSG to union against this CSG
     */
    CSG.prototype.unionInPlace = function (csg) {
        var a = new Node(this._polygons);
        var b = new Node(csg._polygons);
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        this._polygons = a.allPolygons();
    };
    /**
     * Subtracts this CSG with another CSG
     * @param csg The CSG to subtract against this CSG
     * @returns A new CSG
     */
    CSG.prototype.subtract = function (csg) {
        var a = new Node(this.clone()._polygons);
        var b = new Node(csg.clone()._polygons);
        a.invert();
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a.invert();
        return CSG._FromPolygons(a.allPolygons()).copyTransformAttributes(this);
    };
    /**
     * Subtracts this CSG with another CSG in place
     * @param csg The CSG to subtract against this CSG
     */
    CSG.prototype.subtractInPlace = function (csg) {
        var a = new Node(this._polygons);
        var b = new Node(csg._polygons);
        a.invert();
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a.invert();
        this._polygons = a.allPolygons();
    };
    /**
     * Intersect this CSG with another CSG
     * @param csg The CSG to intersect against this CSG
     * @returns A new CSG
     */
    CSG.prototype.intersect = function (csg) {
        var a = new Node(this.clone()._polygons);
        var b = new Node(csg.clone()._polygons);
        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.build(b.allPolygons());
        a.invert();
        return CSG._FromPolygons(a.allPolygons()).copyTransformAttributes(this);
    };
    /**
     * Intersects this CSG with another CSG in place
     * @param csg The CSG to intersect against this CSG
     */
    CSG.prototype.intersectInPlace = function (csg) {
        var a = new Node(this._polygons);
        var b = new Node(csg._polygons);
        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.build(b.allPolygons());
        a.invert();
        this._polygons = a.allPolygons();
    };
    /**
     * Return a new CSG solid with solid and empty space switched. This solid is
     * not modified.
     * @returns A new CSG solid with solid and empty space switched
     */
    CSG.prototype.inverse = function () {
        var csg = this.clone();
        csg.inverseInPlace();
        return csg;
    };
    /**
     * Inverses the CSG in place
     */
    CSG.prototype.inverseInPlace = function () {
        this._polygons.map(function (p) {
            p.flip();
        });
    };
    /**
     * This is used to keep meshes transformations so they can be restored
     * when we build back a Babylon Mesh
     * NB : All CSG operations are performed in world coordinates
     * @param csg The CSG to copy the transform attributes from
     * @returns This CSG
     */
    CSG.prototype.copyTransformAttributes = function (csg) {
        this.matrix = csg.matrix;
        this.position = csg.position;
        this.rotation = csg.rotation;
        this.scaling = csg.scaling;
        this.rotationQuaternion = csg.rotationQuaternion;
        return this;
    };
    /**
     * Build Raw mesh from CSG
     * Coordinates here are in world space
     * @param name The name of the mesh geometry
     * @param scene The Scene
     * @param keepSubMeshes Specifies if the submeshes should be kept
     * @returns A new Mesh
     */
    CSG.prototype.buildMeshGeometry = function (name, scene, keepSubMeshes) {
        var matrix = this.matrix.clone();
        matrix.invert();
        var mesh = new Mesh(name, scene);
        var vertices = [];
        var indices = [];
        var normals = [];
        var uvs = null;
        var vertColors = null;
        var vertex = Vector3.Zero();
        var normal = Vector3.Zero();
        var uv = Vector2.Zero();
        var vertColor = new Color4(0, 0, 0, 0);
        var polygons = this._polygons;
        var polygonIndices = [0, 0, 0];
        var polygon;
        var vertice_dict = {};
        var vertex_idx;
        var currentIndex = 0;
        var subMeshDict = {};
        var subMeshObj;
        if (keepSubMeshes) {
            // Sort Polygons, since subMeshes are indices range
            polygons.sort(function (a, b) {
                if (a.shared.meshId === b.shared.meshId) {
                    return a.shared.subMeshId - b.shared.subMeshId;
                }
                else {
                    return a.shared.meshId - b.shared.meshId;
                }
            });
        }
        for (var i = 0, il = polygons.length; i < il; i++) {
            polygon = polygons[i];
            // Building SubMeshes
            if (!subMeshDict[polygon.shared.meshId]) {
                subMeshDict[polygon.shared.meshId] = {};
            }
            if (!subMeshDict[polygon.shared.meshId][polygon.shared.subMeshId]) {
                subMeshDict[polygon.shared.meshId][polygon.shared.subMeshId] = {
                    indexStart: +Infinity,
                    indexEnd: -Infinity,
                    materialIndex: polygon.shared.materialIndex,
                };
            }
            subMeshObj = subMeshDict[polygon.shared.meshId][polygon.shared.subMeshId];
            for (var j = 2, jl = polygon.vertices.length; j < jl; j++) {
                polygonIndices[0] = 0;
                polygonIndices[1] = j - 1;
                polygonIndices[2] = j;
                for (var k = 0; k < 3; k++) {
                    vertex.copyFrom(polygon.vertices[polygonIndices[k]].pos);
                    normal.copyFrom(polygon.vertices[polygonIndices[k]].normal);
                    if (polygon.vertices[polygonIndices[k]].uv) {
                        if (!uvs) {
                            uvs = [];
                        }
                        uv.copyFrom(polygon.vertices[polygonIndices[k]].uv);
                    }
                    if (polygon.vertices[polygonIndices[k]].vertColor) {
                        if (!vertColors) {
                            vertColors = [];
                        }
                        vertColor.copyFrom(polygon.vertices[polygonIndices[k]].vertColor);
                    }
                    var localVertex = Vector3.TransformCoordinates(vertex, matrix);
                    var localNormal = Vector3.TransformNormal(normal, matrix);
                    vertex_idx = vertice_dict[localVertex.x + "," + localVertex.y + "," + localVertex.z];
                    var areUvsDifferent = false;
                    if (uvs && !(uvs[vertex_idx * 2] === uv.x || uvs[vertex_idx * 2 + 1] === uv.y)) {
                        areUvsDifferent = true;
                    }
                    var areColorsDifferent = false;
                    if (vertColors &&
                        !(vertColors[vertex_idx * 4] === vertColor.r ||
                            vertColors[vertex_idx * 4 + 1] === vertColor.g ||
                            vertColors[vertex_idx * 4 + 2] === vertColor.b ||
                            vertColors[vertex_idx * 4 + 3] === vertColor.a)) {
                        areColorsDifferent = true;
                    }
                    // Check if 2 points can be merged
                    if (!(typeof vertex_idx !== "undefined" &&
                        normals[vertex_idx * 3] === localNormal.x &&
                        normals[vertex_idx * 3 + 1] === localNormal.y &&
                        normals[vertex_idx * 3 + 2] === localNormal.z) ||
                        areUvsDifferent ||
                        areColorsDifferent) {
                        vertices.push(localVertex.x, localVertex.y, localVertex.z);
                        if (uvs) {
                            uvs.push(uv.x, uv.y);
                        }
                        normals.push(normal.x, normal.y, normal.z);
                        if (vertColors) {
                            vertColors.push(vertColor.r, vertColor.g, vertColor.b, vertColor.a);
                        }
                        vertex_idx = vertice_dict[localVertex.x + "," + localVertex.y + "," + localVertex.z] = vertices.length / 3 - 1;
                    }
                    indices.push(vertex_idx);
                    subMeshObj.indexStart = Math.min(currentIndex, subMeshObj.indexStart);
                    subMeshObj.indexEnd = Math.max(currentIndex, subMeshObj.indexEnd);
                    currentIndex++;
                }
            }
        }
        mesh.setVerticesData(VertexBuffer.PositionKind, vertices);
        mesh.setVerticesData(VertexBuffer.NormalKind, normals);
        if (uvs) {
            mesh.setVerticesData(VertexBuffer.UVKind, uvs);
        }
        if (vertColors) {
            mesh.setVerticesData(VertexBuffer.ColorKind, vertColors);
        }
        mesh.setIndices(indices, null);
        if (keepSubMeshes) {
            // We offset the materialIndex by the previous number of materials in the CSG mixed meshes
            var materialIndexOffset = 0, materialMaxIndex = void 0;
            mesh.subMeshes = new Array();
            for (var m in subMeshDict) {
                materialMaxIndex = -1;
                for (var sm in subMeshDict[m]) {
                    subMeshObj = subMeshDict[m][sm];
                    SubMesh.CreateFromIndices(subMeshObj.materialIndex + materialIndexOffset, subMeshObj.indexStart, subMeshObj.indexEnd - subMeshObj.indexStart + 1, mesh);
                    materialMaxIndex = Math.max(subMeshObj.materialIndex, materialMaxIndex);
                }
                materialIndexOffset += ++materialMaxIndex;
            }
        }
        return mesh;
    };
    /**
     * Build Mesh from CSG taking material and transforms into account
     * @param name The name of the Mesh
     * @param material The material of the Mesh
     * @param scene The Scene
     * @param keepSubMeshes Specifies if submeshes should be kept
     * @returns The new Mesh
     */
    CSG.prototype.toMesh = function (name, material, scene, keepSubMeshes) {
        if (material === void 0) { material = null; }
        var mesh = this.buildMeshGeometry(name, scene, keepSubMeshes);
        mesh.material = material;
        mesh.position.copyFrom(this.position);
        mesh.rotation.copyFrom(this.rotation);
        if (this.rotationQuaternion) {
            mesh.rotationQuaternion = this.rotationQuaternion.clone();
        }
        mesh.scaling.copyFrom(this.scaling);
        mesh.computeWorldMatrix(true);
        return mesh;
    };
    return CSG;
}());
export { CSG };
//# sourceMappingURL=csg.js.map