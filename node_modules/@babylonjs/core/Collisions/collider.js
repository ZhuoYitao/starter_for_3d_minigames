import { Vector3 } from "../Maths/math.vector.js";
import { Plane } from "../Maths/math.plane.js";
var intersectBoxAASphere = function (boxMin, boxMax, sphereCenter, sphereRadius) {
    if (boxMin.x > sphereCenter.x + sphereRadius) {
        return false;
    }
    if (sphereCenter.x - sphereRadius > boxMax.x) {
        return false;
    }
    if (boxMin.y > sphereCenter.y + sphereRadius) {
        return false;
    }
    if (sphereCenter.y - sphereRadius > boxMax.y) {
        return false;
    }
    if (boxMin.z > sphereCenter.z + sphereRadius) {
        return false;
    }
    if (sphereCenter.z - sphereRadius > boxMax.z) {
        return false;
    }
    return true;
};
var getLowestRoot = (function () {
    var result = { root: 0, found: false };
    return function (a, b, c, maxR) {
        result.root = 0;
        result.found = false;
        var determinant = b * b - 4.0 * a * c;
        if (determinant < 0) {
            return result;
        }
        var sqrtD = Math.sqrt(determinant);
        var r1 = (-b - sqrtD) / (2.0 * a);
        var r2 = (-b + sqrtD) / (2.0 * a);
        if (r1 > r2) {
            var temp = r2;
            r2 = r1;
            r1 = temp;
        }
        if (r1 > 0 && r1 < maxR) {
            result.root = r1;
            result.found = true;
            return result;
        }
        if (r2 > 0 && r2 < maxR) {
            result.root = r2;
            result.found = true;
            return result;
        }
        return result;
    };
})();
/** @hidden */
var Collider = /** @class */ (function () {
    function Collider() {
        // Implementation of the "Improved Collision detection and Response" algorithm proposed by Kasper Fauerby
        // https://www.peroxide.dk/papers/collision/collision.pdf
        this._collisionPoint = Vector3.Zero();
        this._planeIntersectionPoint = Vector3.Zero();
        this._tempVector = Vector3.Zero();
        this._tempVector2 = Vector3.Zero();
        this._tempVector3 = Vector3.Zero();
        this._tempVector4 = Vector3.Zero();
        this._edge = Vector3.Zero();
        this._baseToVertex = Vector3.Zero();
        this._destinationPoint = Vector3.Zero();
        this._slidePlaneNormal = Vector3.Zero();
        this._displacementVector = Vector3.Zero();
        /** @hidden */
        this._radius = Vector3.One();
        /** @hidden */
        this._retry = 0;
        /** @hidden */
        this._basePointWorld = Vector3.Zero();
        this._velocityWorld = Vector3.Zero();
        this._normalizedVelocity = Vector3.Zero();
        this._collisionMask = -1;
    }
    Object.defineProperty(Collider.prototype, "collisionMask", {
        get: function () {
            return this._collisionMask;
        },
        set: function (mask) {
            this._collisionMask = !isNaN(mask) ? mask : -1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Collider.prototype, "slidePlaneNormal", {
        /**
         * Gets the plane normal used to compute the sliding response (in local space)
         */
        get: function () {
            return this._slidePlaneNormal;
        },
        enumerable: false,
        configurable: true
    });
    // Methods
    /**
     * @param source
     * @param dir
     * @param e
     * @hidden
     */
    Collider.prototype._initialize = function (source, dir, e) {
        this._velocity = dir;
        this._velocitySquaredLength = this._velocity.lengthSquared();
        var len = Math.sqrt(this._velocitySquaredLength);
        if (len === 0 || len === 1.0) {
            this._normalizedVelocity.copyFromFloats(dir._x, dir._y, dir._z);
        }
        else {
            dir.scaleToRef(1.0 / len, this._normalizedVelocity);
        }
        this._basePoint = source;
        source.multiplyToRef(this._radius, this._basePointWorld);
        dir.multiplyToRef(this._radius, this._velocityWorld);
        this._velocityWorldLength = this._velocityWorld.length();
        this._epsilon = e;
        this.collisionFound = false;
    };
    /**
     * @param point
     * @param pa
     * @param pb
     * @param pc
     * @param n
     * @hidden
     */
    Collider.prototype._checkPointInTriangle = function (point, pa, pb, pc, n) {
        pa.subtractToRef(point, this._tempVector);
        pb.subtractToRef(point, this._tempVector2);
        Vector3.CrossToRef(this._tempVector, this._tempVector2, this._tempVector4);
        var d = Vector3.Dot(this._tempVector4, n);
        if (d < 0) {
            return false;
        }
        pc.subtractToRef(point, this._tempVector3);
        Vector3.CrossToRef(this._tempVector2, this._tempVector3, this._tempVector4);
        d = Vector3.Dot(this._tempVector4, n);
        if (d < 0) {
            return false;
        }
        Vector3.CrossToRef(this._tempVector3, this._tempVector, this._tempVector4);
        d = Vector3.Dot(this._tempVector4, n);
        return d >= 0;
    };
    /**
     * @param sphereCenter
     * @param sphereRadius
     * @param vecMin
     * @param vecMax
     * @hidden
     */
    Collider.prototype._canDoCollision = function (sphereCenter, sphereRadius, vecMin, vecMax) {
        var distance = Vector3.Distance(this._basePointWorld, sphereCenter);
        var max = Math.max(this._radius.x, this._radius.y, this._radius.z);
        if (distance > this._velocityWorldLength + max + sphereRadius) {
            return false;
        }
        if (!intersectBoxAASphere(vecMin, vecMax, this._basePointWorld, this._velocityWorldLength + max)) {
            return false;
        }
        return true;
    };
    /**
     * @param faceIndex
     * @param trianglePlaneArray
     * @param p1
     * @param p2
     * @param p3
     * @param hasMaterial
     * @param hostMesh
     * @hidden
     */
    Collider.prototype._testTriangle = function (faceIndex, trianglePlaneArray, p1, p2, p3, hasMaterial, hostMesh) {
        var t0;
        var embeddedInPlane = false;
        //defensive programming, actually not needed.
        if (!trianglePlaneArray) {
            trianglePlaneArray = [];
        }
        if (!trianglePlaneArray[faceIndex]) {
            trianglePlaneArray[faceIndex] = new Plane(0, 0, 0, 0);
            trianglePlaneArray[faceIndex].copyFromPoints(p1, p2, p3);
        }
        var trianglePlane = trianglePlaneArray[faceIndex];
        if (!hasMaterial && !trianglePlane.isFrontFacingTo(this._normalizedVelocity, 0)) {
            return;
        }
        var signedDistToTrianglePlane = trianglePlane.signedDistanceTo(this._basePoint);
        var normalDotVelocity = Vector3.Dot(trianglePlane.normal, this._velocity);
        // if DoubleSidedCheck is false(default), a double sided face will be consided 2 times.
        // if true, it discard the faces having normal not facing velocity
        if (Collider.DoubleSidedCheck && normalDotVelocity > 0.0001) {
            return;
        }
        if (normalDotVelocity == 0) {
            if (Math.abs(signedDistToTrianglePlane) >= 1.0) {
                return;
            }
            embeddedInPlane = true;
            t0 = 0;
        }
        else {
            t0 = (-1.0 - signedDistToTrianglePlane) / normalDotVelocity;
            var t1 = (1.0 - signedDistToTrianglePlane) / normalDotVelocity;
            if (t0 > t1) {
                var temp = t1;
                t1 = t0;
                t0 = temp;
            }
            if (t0 > 1.0 || t1 < 0.0) {
                return;
            }
            if (t0 < 0) {
                t0 = 0;
            }
            if (t0 > 1.0) {
                t0 = 1.0;
            }
        }
        this._collisionPoint.copyFromFloats(0, 0, 0);
        var found = false;
        var t = 1.0;
        if (!embeddedInPlane) {
            this._basePoint.subtractToRef(trianglePlane.normal, this._planeIntersectionPoint);
            this._velocity.scaleToRef(t0, this._tempVector);
            this._planeIntersectionPoint.addInPlace(this._tempVector);
            if (this._checkPointInTriangle(this._planeIntersectionPoint, p1, p2, p3, trianglePlane.normal)) {
                found = true;
                t = t0;
                this._collisionPoint.copyFrom(this._planeIntersectionPoint);
            }
        }
        if (!found) {
            var a = this._velocitySquaredLength;
            this._basePoint.subtractToRef(p1, this._tempVector);
            var b = 2.0 * Vector3.Dot(this._velocity, this._tempVector);
            var c = this._tempVector.lengthSquared() - 1.0;
            var lowestRoot = getLowestRoot(a, b, c, t);
            if (lowestRoot.found) {
                t = lowestRoot.root;
                found = true;
                this._collisionPoint.copyFrom(p1);
            }
            this._basePoint.subtractToRef(p2, this._tempVector);
            b = 2.0 * Vector3.Dot(this._velocity, this._tempVector);
            c = this._tempVector.lengthSquared() - 1.0;
            lowestRoot = getLowestRoot(a, b, c, t);
            if (lowestRoot.found) {
                t = lowestRoot.root;
                found = true;
                this._collisionPoint.copyFrom(p2);
            }
            this._basePoint.subtractToRef(p3, this._tempVector);
            b = 2.0 * Vector3.Dot(this._velocity, this._tempVector);
            c = this._tempVector.lengthSquared() - 1.0;
            lowestRoot = getLowestRoot(a, b, c, t);
            if (lowestRoot.found) {
                t = lowestRoot.root;
                found = true;
                this._collisionPoint.copyFrom(p3);
            }
            p2.subtractToRef(p1, this._edge);
            p1.subtractToRef(this._basePoint, this._baseToVertex);
            var edgeSquaredLength = this._edge.lengthSquared();
            var edgeDotVelocity = Vector3.Dot(this._edge, this._velocity);
            var edgeDotBaseToVertex = Vector3.Dot(this._edge, this._baseToVertex);
            a = edgeSquaredLength * -this._velocitySquaredLength + edgeDotVelocity * edgeDotVelocity;
            b = 2 * (edgeSquaredLength * Vector3.Dot(this._velocity, this._baseToVertex) - edgeDotVelocity * edgeDotBaseToVertex);
            c = edgeSquaredLength * (1.0 - this._baseToVertex.lengthSquared()) + edgeDotBaseToVertex * edgeDotBaseToVertex;
            lowestRoot = getLowestRoot(a, b, c, t);
            if (lowestRoot.found) {
                var f = (edgeDotVelocity * lowestRoot.root - edgeDotBaseToVertex) / edgeSquaredLength;
                if (f >= 0.0 && f <= 1.0) {
                    t = lowestRoot.root;
                    found = true;
                    this._edge.scaleInPlace(f);
                    p1.addToRef(this._edge, this._collisionPoint);
                }
            }
            p3.subtractToRef(p2, this._edge);
            p2.subtractToRef(this._basePoint, this._baseToVertex);
            edgeSquaredLength = this._edge.lengthSquared();
            edgeDotVelocity = Vector3.Dot(this._edge, this._velocity);
            edgeDotBaseToVertex = Vector3.Dot(this._edge, this._baseToVertex);
            a = edgeSquaredLength * -this._velocitySquaredLength + edgeDotVelocity * edgeDotVelocity;
            b = 2 * (edgeSquaredLength * Vector3.Dot(this._velocity, this._baseToVertex) - edgeDotVelocity * edgeDotBaseToVertex);
            c = edgeSquaredLength * (1.0 - this._baseToVertex.lengthSquared()) + edgeDotBaseToVertex * edgeDotBaseToVertex;
            lowestRoot = getLowestRoot(a, b, c, t);
            if (lowestRoot.found) {
                var f = (edgeDotVelocity * lowestRoot.root - edgeDotBaseToVertex) / edgeSquaredLength;
                if (f >= 0.0 && f <= 1.0) {
                    t = lowestRoot.root;
                    found = true;
                    this._edge.scaleInPlace(f);
                    p2.addToRef(this._edge, this._collisionPoint);
                }
            }
            p1.subtractToRef(p3, this._edge);
            p3.subtractToRef(this._basePoint, this._baseToVertex);
            edgeSquaredLength = this._edge.lengthSquared();
            edgeDotVelocity = Vector3.Dot(this._edge, this._velocity);
            edgeDotBaseToVertex = Vector3.Dot(this._edge, this._baseToVertex);
            a = edgeSquaredLength * -this._velocitySquaredLength + edgeDotVelocity * edgeDotVelocity;
            b = 2 * (edgeSquaredLength * Vector3.Dot(this._velocity, this._baseToVertex) - edgeDotVelocity * edgeDotBaseToVertex);
            c = edgeSquaredLength * (1.0 - this._baseToVertex.lengthSquared()) + edgeDotBaseToVertex * edgeDotBaseToVertex;
            lowestRoot = getLowestRoot(a, b, c, t);
            if (lowestRoot.found) {
                var f = (edgeDotVelocity * lowestRoot.root - edgeDotBaseToVertex) / edgeSquaredLength;
                if (f >= 0.0 && f <= 1.0) {
                    t = lowestRoot.root;
                    found = true;
                    this._edge.scaleInPlace(f);
                    p3.addToRef(this._edge, this._collisionPoint);
                }
            }
        }
        if (found) {
            var distToCollisionSquared = t * t * this._velocitySquaredLength;
            if (!this.collisionFound || distToCollisionSquared < this._nearestDistanceSquared) {
                // if collisionResponse is false, collision is not found but the collidedMesh is set anyway.
                // onCollide observable are triggered if collideMesh is set
                // this allow trigger volumes to be created.
                if (hostMesh.collisionResponse) {
                    if (!this.intersectionPoint) {
                        this.intersectionPoint = this._collisionPoint.clone();
                    }
                    else {
                        this.intersectionPoint.copyFrom(this._collisionPoint);
                    }
                    this._nearestDistanceSquared = distToCollisionSquared;
                    this._nearestDistance = Math.sqrt(distToCollisionSquared);
                    this.collisionFound = true;
                }
                this.collidedMesh = hostMesh;
            }
        }
    };
    /**
     * @param trianglePlaneArray
     * @param pts
     * @param indices
     * @param indexStart
     * @param indexEnd
     * @param decal
     * @param hasMaterial
     * @param hostMesh
     * @param invertTriangles
     * @param triangleStrip
     * @hidden
     */
    Collider.prototype._collide = function (trianglePlaneArray, pts, indices, indexStart, indexEnd, decal, hasMaterial, hostMesh, invertTriangles, triangleStrip) {
        if (triangleStrip === void 0) { triangleStrip = false; }
        if (triangleStrip) {
            if (!indices || indices.length === 0) {
                for (var i = 0; i < pts.length - 2; i += 1) {
                    var p1 = pts[i];
                    var p2 = pts[i + 1];
                    var p3 = pts[i + 2];
                    // stay defensive and don't check against undefined positions.
                    if (!p1 || !p2 || !p3) {
                        continue;
                    }
                    // Handles strip faces one on two is reversed
                    if ((invertTriangles ? 1 : 0) ^ i % 2) {
                        this._testTriangle(i, trianglePlaneArray, p1, p2, p3, hasMaterial, hostMesh);
                    }
                    else {
                        this._testTriangle(i, trianglePlaneArray, p2, p1, p3, hasMaterial, hostMesh);
                    }
                }
            }
            else {
                for (var i = indexStart; i < indexEnd - 2; i += 1) {
                    var indexA = indices[i];
                    var indexB = indices[i + 1];
                    var indexC = indices[i + 2];
                    if (indexC === 0xffffffff) {
                        i += 2;
                        continue;
                    }
                    var p1 = pts[indexA];
                    var p2 = pts[indexB];
                    var p3 = pts[indexC];
                    // stay defensive and don't check against undefined positions.
                    if (!p1 || !p2 || !p3) {
                        continue;
                    }
                    // Handles strip faces one on two is reversed
                    if ((invertTriangles ? 1 : 0) ^ i % 2) {
                        this._testTriangle(i, trianglePlaneArray, p1, p2, p3, hasMaterial, hostMesh);
                    }
                    else {
                        this._testTriangle(i, trianglePlaneArray, p2, p1, p3, hasMaterial, hostMesh);
                    }
                }
            }
        }
        else if (!indices || indices.length === 0) {
            for (var i = 0; i < pts.length; i += 3) {
                var p1 = pts[i];
                var p2 = pts[i + 1];
                var p3 = pts[i + 2];
                if (invertTriangles) {
                    this._testTriangle(i, trianglePlaneArray, p1, p2, p3, hasMaterial, hostMesh);
                }
                else {
                    this._testTriangle(i, trianglePlaneArray, p3, p2, p1, hasMaterial, hostMesh);
                }
            }
        }
        else {
            for (var i = indexStart; i < indexEnd; i += 3) {
                var p1 = pts[indices[i] - decal];
                var p2 = pts[indices[i + 1] - decal];
                var p3 = pts[indices[i + 2] - decal];
                if (invertTriangles) {
                    this._testTriangle(i, trianglePlaneArray, p1, p2, p3, hasMaterial, hostMesh);
                }
                else {
                    this._testTriangle(i, trianglePlaneArray, p3, p2, p1, hasMaterial, hostMesh);
                }
            }
        }
    };
    /**
     * @param pos
     * @param vel
     * @hidden
     */
    Collider.prototype._getResponse = function (pos, vel) {
        pos.addToRef(vel, this._destinationPoint);
        vel.scaleInPlace(this._nearestDistance / vel.length());
        this._basePoint.addToRef(vel, pos);
        pos.subtractToRef(this.intersectionPoint, this._slidePlaneNormal);
        this._slidePlaneNormal.normalize();
        this._slidePlaneNormal.scaleToRef(this._epsilon, this._displacementVector);
        pos.addInPlace(this._displacementVector);
        this.intersectionPoint.addInPlace(this._displacementVector);
        this._slidePlaneNormal.scaleInPlace(Plane.SignedDistanceToPlaneFromPositionAndNormal(this.intersectionPoint, this._slidePlaneNormal, this._destinationPoint));
        this._destinationPoint.subtractInPlace(this._slidePlaneNormal);
        this._destinationPoint.subtractToRef(this.intersectionPoint, vel);
    };
    /**
     * If true, it check for double sided faces and only returns 1 collision instead of 2
     */
    Collider.DoubleSidedCheck = false;
    return Collider;
}());
export { Collider };
//# sourceMappingURL=collider.js.map