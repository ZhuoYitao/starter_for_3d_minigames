import { __extends } from "tslib";
import { Logger } from "../Misc/logger.js";
import { Vector3, Vector2 } from "../Maths/math.vector.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Mesh } from "../Meshes/mesh.js";
import { VertexData } from "../Meshes/mesh.vertexData.js";
import { Path2 } from "../Maths/math.path.js";
import { Epsilon } from "../Maths/math.constants.js";
import { EngineStore } from "../Engines/engineStore.js";
/**
 * Vector2 wth index property
 */
var IndexedVector2 = /** @class */ (function (_super) {
    __extends(IndexedVector2, _super);
    function IndexedVector2(original, 
    /** Index of the vector2 */
    index) {
        var _this = _super.call(this, original.x, original.y) || this;
        _this.index = index;
        return _this;
    }
    return IndexedVector2;
}(Vector2));
/**
 * Defines points to create a polygon
 */
var PolygonPoints = /** @class */ (function () {
    function PolygonPoints() {
        this.elements = new Array();
    }
    PolygonPoints.prototype.add = function (originalPoints) {
        var _this = this;
        var result = new Array();
        originalPoints.forEach(function (point) {
            var newPoint = new IndexedVector2(point, _this.elements.length);
            result.push(newPoint);
            _this.elements.push(newPoint);
        });
        return result;
    };
    PolygonPoints.prototype.computeBounds = function () {
        var lmin = new Vector2(this.elements[0].x, this.elements[0].y);
        var lmax = new Vector2(this.elements[0].x, this.elements[0].y);
        this.elements.forEach(function (point) {
            // x
            if (point.x < lmin.x) {
                lmin.x = point.x;
            }
            else if (point.x > lmax.x) {
                lmax.x = point.x;
            }
            // y
            if (point.y < lmin.y) {
                lmin.y = point.y;
            }
            else if (point.y > lmax.y) {
                lmax.y = point.y;
            }
        });
        return {
            min: lmin,
            max: lmax,
            width: lmax.x - lmin.x,
            height: lmax.y - lmin.y,
        };
    };
    return PolygonPoints;
}());
/**
 * Polygon
 * @see https://doc.babylonjs.com/how_to/parametric_shapes#non-regular-polygon
 */
var Polygon = /** @class */ (function () {
    function Polygon() {
    }
    /**
     * Creates a rectangle
     * @param xmin bottom X coord
     * @param ymin bottom Y coord
     * @param xmax top X coord
     * @param ymax top Y coord
     * @returns points that make the resulting rectangle
     */
    Polygon.Rectangle = function (xmin, ymin, xmax, ymax) {
        return [new Vector2(xmin, ymin), new Vector2(xmax, ymin), new Vector2(xmax, ymax), new Vector2(xmin, ymax)];
    };
    /**
     * Creates a circle
     * @param radius radius of circle
     * @param cx scale in x
     * @param cy scale in y
     * @param numberOfSides number of sides that make up the circle
     * @returns points that make the resulting circle
     */
    Polygon.Circle = function (radius, cx, cy, numberOfSides) {
        if (cx === void 0) { cx = 0; }
        if (cy === void 0) { cy = 0; }
        if (numberOfSides === void 0) { numberOfSides = 32; }
        var result = new Array();
        var angle = 0;
        var increment = (Math.PI * 2) / numberOfSides;
        for (var i = 0; i < numberOfSides; i++) {
            result.push(new Vector2(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius));
            angle -= increment;
        }
        return result;
    };
    /**
     * Creates a polygon from input string
     * @param input Input polygon data
     * @returns the parsed points
     */
    Polygon.Parse = function (input) {
        var floats = input
            .split(/[^-+eE.\d]+/)
            .map(parseFloat)
            .filter(function (val) { return !isNaN(val); });
        var i;
        var result = [];
        for (i = 0; i < (floats.length & 0x7ffffffe); i += 2) {
            result.push(new Vector2(floats[i], floats[i + 1]));
        }
        return result;
    };
    /**
     * Starts building a polygon from x and y coordinates
     * @param x x coordinate
     * @param y y coordinate
     * @returns the started path2
     */
    Polygon.StartingAt = function (x, y) {
        return Path2.StartingAt(x, y);
    };
    return Polygon;
}());
export { Polygon };
/**
 * Builds a polygon
 * @see https://doc.babylonjs.com/how_to/polygonmeshbuilder
 */
var PolygonMeshBuilder = /** @class */ (function () {
    /**
     * Creates a PolygonMeshBuilder
     * @param name name of the builder
     * @param contours Path of the polygon
     * @param scene scene to add to when creating the mesh
     * @param earcutInjection can be used to inject your own earcut reference
     */
    function PolygonMeshBuilder(name, contours, scene, earcutInjection) {
        if (earcutInjection === void 0) { earcutInjection = earcut; }
        this._points = new PolygonPoints();
        this._outlinepoints = new PolygonPoints();
        this._holes = new Array();
        this._epoints = new Array();
        this._eholes = new Array();
        this.bjsEarcut = earcutInjection;
        this._name = name;
        this._scene = scene || EngineStore.LastCreatedScene;
        var points;
        if (contours instanceof Path2) {
            points = contours.getPoints();
        }
        else {
            points = contours;
        }
        this._addToepoint(points);
        this._points.add(points);
        this._outlinepoints.add(points);
        if (typeof this.bjsEarcut === "undefined") {
            Logger.Warn("Earcut was not found, the polygon will not be built.");
        }
    }
    PolygonMeshBuilder.prototype._addToepoint = function (points) {
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            this._epoints.push(p.x, p.y);
        }
    };
    /**
     * Adds a hole within the polygon
     * @param hole Array of points defining the hole
     * @returns this
     */
    PolygonMeshBuilder.prototype.addHole = function (hole) {
        this._points.add(hole);
        var holepoints = new PolygonPoints();
        holepoints.add(hole);
        this._holes.push(holepoints);
        this._eholes.push(this._epoints.length / 2);
        this._addToepoint(hole);
        return this;
    };
    /**
     * Creates the polygon
     * @param updatable If the mesh should be updatable
     * @param depth The depth of the mesh created
     * @param smoothingThreshold Dot product threshold for smoothed normals
     * @returns the created mesh
     */
    PolygonMeshBuilder.prototype.build = function (updatable, depth, smoothingThreshold) {
        if (updatable === void 0) { updatable = false; }
        if (depth === void 0) { depth = 0; }
        if (smoothingThreshold === void 0) { smoothingThreshold = 2; }
        var result = new Mesh(this._name, this._scene);
        var vertexData = this.buildVertexData(depth, smoothingThreshold);
        result.setVerticesData(VertexBuffer.PositionKind, vertexData.positions, updatable);
        result.setVerticesData(VertexBuffer.NormalKind, vertexData.normals, updatable);
        result.setVerticesData(VertexBuffer.UVKind, vertexData.uvs, updatable);
        result.setIndices(vertexData.indices);
        return result;
    };
    /**
     * Creates the polygon
     * @param depth The depth of the mesh created
     * @param smoothingThreshold Dot product threshold for smoothed normals
     * @returns the created VertexData
     */
    PolygonMeshBuilder.prototype.buildVertexData = function (depth, smoothingThreshold) {
        var _this = this;
        if (depth === void 0) { depth = 0; }
        if (smoothingThreshold === void 0) { smoothingThreshold = 2; }
        var result = new VertexData();
        var normals = new Array();
        var positions = new Array();
        var uvs = new Array();
        var bounds = this._points.computeBounds();
        this._points.elements.forEach(function (p) {
            normals.push(0, 1.0, 0);
            positions.push(p.x, 0, p.y);
            uvs.push((p.x - bounds.min.x) / bounds.width, (p.y - bounds.min.y) / bounds.height);
        });
        var indices = new Array();
        var res = this.bjsEarcut(this._epoints, this._eholes, 2);
        for (var i = 0; i < res.length; i++) {
            indices.push(res[i]);
        }
        if (depth > 0) {
            var positionscount = positions.length / 3; //get the current pointcount
            this._points.elements.forEach(function (p) {
                //add the elements at the depth
                normals.push(0, -1.0, 0);
                positions.push(p.x, -depth, p.y);
                uvs.push(1 - (p.x - bounds.min.x) / bounds.width, 1 - (p.y - bounds.min.y) / bounds.height);
            });
            var totalCount = indices.length;
            for (var i = 0; i < totalCount; i += 3) {
                var i0 = indices[i + 0];
                var i1 = indices[i + 1];
                var i2 = indices[i + 2];
                indices.push(i2 + positionscount);
                indices.push(i1 + positionscount);
                indices.push(i0 + positionscount);
            }
            //Add the sides
            this._addSide(positions, normals, uvs, indices, bounds, this._outlinepoints, depth, false, smoothingThreshold);
            this._holes.forEach(function (hole) {
                _this._addSide(positions, normals, uvs, indices, bounds, hole, depth, true, smoothingThreshold);
            });
        }
        result.indices = indices;
        result.positions = positions;
        result.normals = normals;
        result.uvs = uvs;
        return result;
    };
    /**
     * Adds a side to the polygon
     * @param positions points that make the polygon
     * @param normals normals of the polygon
     * @param uvs uvs of the polygon
     * @param indices indices of the polygon
     * @param bounds bounds of the polygon
     * @param points points of the polygon
     * @param depth depth of the polygon
     * @param flip flip of the polygon
     * @param smoothingThreshold
     */
    PolygonMeshBuilder.prototype._addSide = function (positions, normals, uvs, indices, bounds, points, depth, flip, smoothingThreshold) {
        var startIndex = positions.length / 3;
        var ulength = 0;
        for (var i = 0; i < points.elements.length; i++) {
            var p = points.elements[i];
            var p1 = points.elements[(i + 1) % points.elements.length];
            positions.push(p.x, 0, p.y);
            positions.push(p.x, -depth, p.y);
            positions.push(p1.x, 0, p1.y);
            positions.push(p1.x, -depth, p1.y);
            var p0 = points.elements[(i + points.elements.length - 1) % points.elements.length];
            var p2 = points.elements[(i + 2) % points.elements.length];
            var vc = new Vector3(-(p1.y - p.y), 0, p1.x - p.x);
            var vp = new Vector3(-(p.y - p0.y), 0, p.x - p0.x);
            var vn = new Vector3(-(p2.y - p1.y), 0, p2.x - p1.x);
            if (!flip) {
                vc = vc.scale(-1);
                vp = vp.scale(-1);
                vn = vn.scale(-1);
            }
            var vc_norm = vc.normalizeToNew();
            var vp_norm = vp.normalizeToNew();
            var vn_norm = vn.normalizeToNew();
            var dotp = Vector3.Dot(vp_norm, vc_norm);
            if (dotp > smoothingThreshold) {
                if (dotp < Epsilon - 1) {
                    vp_norm = new Vector3(p.x, 0, p.y).subtract(new Vector3(p1.x, 0, p1.y)).normalize();
                }
                else {
                    // cheap average weighed by side length
                    vp_norm = vp.add(vc).normalize();
                }
            }
            else {
                vp_norm = vc_norm;
            }
            var dotn = Vector3.Dot(vn, vc);
            if (dotn > smoothingThreshold) {
                if (dotn < Epsilon - 1) {
                    // back to back
                    vn_norm = new Vector3(p1.x, 0, p1.y).subtract(new Vector3(p.x, 0, p.y)).normalize();
                }
                else {
                    // cheap average weighed by side length
                    vn_norm = vn.add(vc).normalize();
                }
            }
            else {
                vn_norm = vc_norm;
            }
            uvs.push(ulength / bounds.width, 0);
            uvs.push(ulength / bounds.width, 1);
            ulength += vc.length();
            uvs.push(ulength / bounds.width, 0);
            uvs.push(ulength / bounds.width, 1);
            normals.push(vp_norm.x, vp_norm.y, vp_norm.z);
            normals.push(vp_norm.x, vp_norm.y, vp_norm.z);
            normals.push(vn_norm.x, vn_norm.y, vn_norm.z);
            normals.push(vn_norm.x, vn_norm.y, vn_norm.z);
            if (!flip) {
                indices.push(startIndex);
                indices.push(startIndex + 1);
                indices.push(startIndex + 2);
                indices.push(startIndex + 1);
                indices.push(startIndex + 3);
                indices.push(startIndex + 2);
            }
            else {
                indices.push(startIndex);
                indices.push(startIndex + 2);
                indices.push(startIndex + 1);
                indices.push(startIndex + 1);
                indices.push(startIndex + 2);
                indices.push(startIndex + 3);
            }
            startIndex += 4;
        }
    };
    return PolygonMeshBuilder;
}());
export { PolygonMeshBuilder };
//# sourceMappingURL=polygonMesh.js.map