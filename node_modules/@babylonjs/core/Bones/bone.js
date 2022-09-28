import { __extends } from "tslib";
import { Vector3, Quaternion, Matrix, TmpVectors } from "../Maths/math.vector.js";
import { ArrayTools } from "../Misc/arrayTools.js";
import { Node } from "../node.js";
import { Space } from "../Maths/math.axis.js";
/**
 * Class used to store bone information
 * @see https://doc.babylonjs.com/how_to/how_to_use_bones_and_skeletons
 */
var Bone = /** @class */ (function (_super) {
    __extends(Bone, _super);
    /**
     * Create a new bone
     * @param name defines the bone name
     * @param skeleton defines the parent skeleton
     * @param parentBone defines the parent (can be null if the bone is the root)
     * @param localMatrix defines the local matrix
     * @param restPose defines the rest pose matrix
     * @param baseMatrix defines the base matrix
     * @param index defines index of the bone in the hierarchy
     */
    function Bone(
    /**
     * defines the bone name
     */
    name, skeleton, parentBone, localMatrix, restPose, baseMatrix, index) {
        if (parentBone === void 0) { parentBone = null; }
        if (localMatrix === void 0) { localMatrix = null; }
        if (restPose === void 0) { restPose = null; }
        if (baseMatrix === void 0) { baseMatrix = null; }
        if (index === void 0) { index = null; }
        var _this = _super.call(this, name, skeleton.getScene()) || this;
        _this.name = name;
        /**
         * Gets the list of child bones
         */
        _this.children = new Array();
        /** Gets the animations associated with this bone */
        _this.animations = new Array();
        /**
         * @hidden Internal only
         * Set this value to map this bone to a different index in the transform matrices
         * Set this value to -1 to exclude the bone from the transform matrices
         */
        _this._index = null;
        _this._absoluteTransform = new Matrix();
        _this._invertedAbsoluteTransform = new Matrix();
        _this._scalingDeterminant = 1;
        _this._worldTransform = new Matrix();
        _this._needToDecompose = true;
        _this._needToCompose = false;
        /** @hidden */
        _this._linkedTransformNode = null;
        /** @hidden */
        _this._waitingTransformNodeId = null;
        _this._skeleton = skeleton;
        _this._localMatrix = localMatrix ? localMatrix.clone() : Matrix.Identity();
        _this._restPose = restPose ? restPose : _this._localMatrix.clone();
        _this._baseMatrix = baseMatrix ? baseMatrix : _this._localMatrix.clone();
        _this._index = index;
        skeleton.bones.push(_this);
        _this.setParent(parentBone, false);
        if (baseMatrix || localMatrix) {
            _this._updateDifferenceMatrix();
        }
        return _this;
    }
    Object.defineProperty(Bone.prototype, "_matrix", {
        /** @hidden */
        get: function () {
            this._compose();
            return this._localMatrix;
        },
        /** @hidden */
        set: function (value) {
            this._needToCompose = false; // in case there was a pending compose
            // skip if the matrices are the same
            if (value.updateFlag === this._localMatrix.updateFlag) {
                return;
            }
            this._localMatrix.copyFrom(value);
            this._markAsDirtyAndDecompose();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the current object class name.
     * @return the class name
     */
    Bone.prototype.getClassName = function () {
        return "Bone";
    };
    // Members
    /**
     * Gets the parent skeleton
     * @returns a skeleton
     */
    Bone.prototype.getSkeleton = function () {
        return this._skeleton;
    };
    Object.defineProperty(Bone.prototype, "parent", {
        get: function () {
            return this._parentNode;
        },
        set: function (newParent) {
            this.setParent(newParent);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets parent bone
     * @returns a bone or null if the bone is the root of the bone hierarchy
     */
    Bone.prototype.getParent = function () {
        return this.parent;
    };
    /**
     * Returns an array containing the root bones
     * @returns an array containing the root bones
     */
    Bone.prototype.getChildren = function () {
        return this.children;
    };
    /**
     * Gets the node index in matrix array generated for rendering
     * @returns the node index
     */
    Bone.prototype.getIndex = function () {
        return this._index === null ? this.getSkeleton().bones.indexOf(this) : this._index;
    };
    /**
     * Sets the parent bone
     * @param parent defines the parent (can be null if the bone is the root)
     * @param updateDifferenceMatrix defines if the difference matrix must be updated
     */
    Bone.prototype.setParent = function (parent, updateDifferenceMatrix) {
        if (updateDifferenceMatrix === void 0) { updateDifferenceMatrix = true; }
        if (this.parent === parent) {
            return;
        }
        if (this.parent) {
            var index = this.parent.children.indexOf(this);
            if (index !== -1) {
                this.parent.children.splice(index, 1);
            }
        }
        this._parentNode = parent;
        if (this.parent) {
            this.parent.children.push(this);
        }
        if (updateDifferenceMatrix) {
            this._updateDifferenceMatrix();
        }
        this.markAsDirty();
    };
    /**
     * Gets the local matrix
     * @returns a matrix
     */
    Bone.prototype.getLocalMatrix = function () {
        this._compose();
        return this._localMatrix;
    };
    /**
     * Gets the base matrix (initial matrix which remains unchanged)
     * @returns the base matrix (as known as bind pose matrix)
     */
    Bone.prototype.getBaseMatrix = function () {
        return this._baseMatrix;
    };
    /**
     * Gets the rest pose matrix
     * @returns a matrix
     */
    Bone.prototype.getRestPose = function () {
        return this._restPose;
    };
    /**
     * Sets the rest pose matrix
     * @param matrix the local-space rest pose to set for this bone
     */
    Bone.prototype.setRestPose = function (matrix) {
        this._restPose.copyFrom(matrix);
    };
    /**
     * Gets the bind pose matrix
     * @returns the bind pose matrix
     * @deprecated Please use getBaseMatrix instead
     */
    Bone.prototype.getBindPose = function () {
        return this._baseMatrix;
    };
    /**
     * Sets the bind pose matrix
     * @param matrix the local-space bind pose to set for this bone
     * @deprecated Please use updateMatrix instead
     */
    Bone.prototype.setBindPose = function (matrix) {
        this.updateMatrix(matrix);
    };
    /**
     * Gets a matrix used to store world matrix (ie. the matrix sent to shaders)
     */
    Bone.prototype.getWorldMatrix = function () {
        return this._worldTransform;
    };
    /**
     * Sets the local matrix to rest pose matrix
     */
    Bone.prototype.returnToRest = function () {
        var _a;
        if (this._linkedTransformNode) {
            var localScaling = TmpVectors.Vector3[0];
            var localRotation = TmpVectors.Quaternion[0];
            var localPosition = TmpVectors.Vector3[1];
            this.getRestPose().decompose(localScaling, localRotation, localPosition);
            this._linkedTransformNode.position.copyFrom(localPosition);
            this._linkedTransformNode.rotationQuaternion = (_a = this._linkedTransformNode.rotationQuaternion) !== null && _a !== void 0 ? _a : Quaternion.Identity();
            this._linkedTransformNode.rotationQuaternion.copyFrom(localRotation);
            this._linkedTransformNode.scaling.copyFrom(localScaling);
        }
        else {
            this._matrix = this._restPose;
        }
    };
    /**
     * Gets the inverse of the absolute transform matrix.
     * This matrix will be multiplied by local matrix to get the difference matrix (ie. the difference between original state and current state)
     * @returns a matrix
     */
    Bone.prototype.getInvertedAbsoluteTransform = function () {
        return this._invertedAbsoluteTransform;
    };
    /**
     * Gets the absolute transform matrix (ie base matrix * parent world matrix)
     * @returns a matrix
     */
    Bone.prototype.getAbsoluteTransform = function () {
        return this._absoluteTransform;
    };
    /**
     * Links with the given transform node.
     * The local matrix of this bone is copied from the transform node every frame.
     * @param transformNode defines the transform node to link to
     */
    Bone.prototype.linkTransformNode = function (transformNode) {
        if (this._linkedTransformNode) {
            this._skeleton._numBonesWithLinkedTransformNode--;
        }
        this._linkedTransformNode = transformNode;
        if (this._linkedTransformNode) {
            this._skeleton._numBonesWithLinkedTransformNode++;
        }
    };
    // Properties (matches TransformNode properties)
    /**
     * Gets the node used to drive the bone's transformation
     * @returns a transform node or null
     */
    Bone.prototype.getTransformNode = function () {
        return this._linkedTransformNode;
    };
    Object.defineProperty(Bone.prototype, "position", {
        /** Gets or sets current position (in local space) */
        get: function () {
            this._decompose();
            return this._localPosition;
        },
        set: function (newPosition) {
            this._decompose();
            this._localPosition.copyFrom(newPosition);
            this._markAsDirtyAndCompose();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bone.prototype, "rotation", {
        /** Gets or sets current rotation (in local space) */
        get: function () {
            return this.getRotation();
        },
        set: function (newRotation) {
            this.setRotation(newRotation);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bone.prototype, "rotationQuaternion", {
        /** Gets or sets current rotation quaternion (in local space) */
        get: function () {
            this._decompose();
            return this._localRotation;
        },
        set: function (newRotation) {
            this.setRotationQuaternion(newRotation);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bone.prototype, "scaling", {
        /** Gets or sets current scaling (in local space) */
        get: function () {
            return this.getScale();
        },
        set: function (newScaling) {
            this.setScale(newScaling);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bone.prototype, "animationPropertiesOverride", {
        /**
         * Gets the animation properties override
         */
        get: function () {
            return this._skeleton.animationPropertiesOverride;
        },
        enumerable: false,
        configurable: true
    });
    // Methods
    Bone.prototype._decompose = function () {
        if (!this._needToDecompose) {
            return;
        }
        this._needToDecompose = false;
        if (!this._localScaling) {
            this._localScaling = Vector3.Zero();
            this._localRotation = Quaternion.Zero();
            this._localPosition = Vector3.Zero();
        }
        this._localMatrix.decompose(this._localScaling, this._localRotation, this._localPosition);
    };
    Bone.prototype._compose = function () {
        if (!this._needToCompose) {
            return;
        }
        if (!this._localScaling) {
            this._needToCompose = false;
            return;
        }
        this._needToCompose = false;
        Matrix.ComposeToRef(this._localScaling, this._localRotation, this._localPosition, this._localMatrix);
    };
    /**
     * Update the base and local matrices
     * @param matrix defines the new base or local matrix
     * @param updateDifferenceMatrix defines if the difference matrix must be updated
     * @param updateLocalMatrix defines if the local matrix should be updated
     */
    Bone.prototype.updateMatrix = function (matrix, updateDifferenceMatrix, updateLocalMatrix) {
        if (updateDifferenceMatrix === void 0) { updateDifferenceMatrix = true; }
        if (updateLocalMatrix === void 0) { updateLocalMatrix = true; }
        this._baseMatrix.copyFrom(matrix);
        if (updateDifferenceMatrix) {
            this._updateDifferenceMatrix();
        }
        if (updateLocalMatrix) {
            this._matrix = matrix;
        }
        else {
            this.markAsDirty();
        }
    };
    /**
     * @param rootMatrix
     * @param updateChildren
     * @hidden
     */
    Bone.prototype._updateDifferenceMatrix = function (rootMatrix, updateChildren) {
        if (updateChildren === void 0) { updateChildren = true; }
        if (!rootMatrix) {
            rootMatrix = this._baseMatrix;
        }
        if (this.parent) {
            rootMatrix.multiplyToRef(this.parent._absoluteTransform, this._absoluteTransform);
        }
        else {
            this._absoluteTransform.copyFrom(rootMatrix);
        }
        this._absoluteTransform.invertToRef(this._invertedAbsoluteTransform);
        if (updateChildren) {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index]._updateDifferenceMatrix();
            }
        }
        this._scalingDeterminant = this._absoluteTransform.determinant() < 0 ? -1 : 1;
    };
    /**
     * Flag the bone as dirty (Forcing it to update everything)
     * @returns this bone
     */
    Bone.prototype.markAsDirty = function () {
        this._currentRenderId++;
        this._childUpdateId++;
        this._skeleton._markAsDirty();
        return this;
    };
    /** @hidden */
    Bone.prototype._markAsDirtyAndCompose = function () {
        this.markAsDirty();
        this._needToCompose = true;
    };
    Bone.prototype._markAsDirtyAndDecompose = function () {
        this.markAsDirty();
        this._needToDecompose = true;
    };
    /**
     * Translate the bone in local or world space
     * @param vec The amount to translate the bone
     * @param space The space that the translation is in
     * @param tNode The TransformNode that this bone is attached to. This is only used in world space
     */
    Bone.prototype.translate = function (vec, space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        var lm = this.getLocalMatrix();
        if (space == Space.LOCAL) {
            lm.addAtIndex(12, vec.x);
            lm.addAtIndex(13, vec.y);
            lm.addAtIndex(14, vec.z);
        }
        else {
            var wm = null;
            //tNode.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
            if (tNode) {
                wm = tNode.getWorldMatrix();
            }
            this._skeleton.computeAbsoluteTransforms();
            var tmat = Bone._TmpMats[0];
            var tvec = Bone._TmpVecs[0];
            if (this.parent) {
                if (tNode && wm) {
                    tmat.copyFrom(this.parent.getAbsoluteTransform());
                    tmat.multiplyToRef(wm, tmat);
                }
                else {
                    tmat.copyFrom(this.parent.getAbsoluteTransform());
                }
            }
            else {
                Matrix.IdentityToRef(tmat);
            }
            tmat.setTranslationFromFloats(0, 0, 0);
            tmat.invert();
            Vector3.TransformCoordinatesToRef(vec, tmat, tvec);
            lm.addAtIndex(12, tvec.x);
            lm.addAtIndex(13, tvec.y);
            lm.addAtIndex(14, tvec.z);
        }
        this._markAsDirtyAndDecompose();
    };
    /**
     * Set the position of the bone in local or world space
     * @param position The position to set the bone
     * @param space The space that the position is in
     * @param tNode The TransformNode that this bone is attached to.  This is only used in world space
     */
    Bone.prototype.setPosition = function (position, space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        var lm = this.getLocalMatrix();
        if (space == Space.LOCAL) {
            lm.setTranslationFromFloats(position.x, position.y, position.z);
        }
        else {
            var wm = null;
            //tNode.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
            if (tNode) {
                wm = tNode.getWorldMatrix();
            }
            this._skeleton.computeAbsoluteTransforms();
            var tmat = Bone._TmpMats[0];
            var vec = Bone._TmpVecs[0];
            if (this.parent) {
                if (tNode && wm) {
                    tmat.copyFrom(this.parent.getAbsoluteTransform());
                    tmat.multiplyToRef(wm, tmat);
                }
                else {
                    tmat.copyFrom(this.parent.getAbsoluteTransform());
                }
                tmat.invert();
            }
            else {
                Matrix.IdentityToRef(tmat);
            }
            Vector3.TransformCoordinatesToRef(position, tmat, vec);
            lm.setTranslationFromFloats(vec.x, vec.y, vec.z);
        }
        this._markAsDirtyAndDecompose();
    };
    /**
     * Set the absolute position of the bone (world space)
     * @param position The position to set the bone
     * @param tNode The TransformNode that this bone is attached to
     */
    Bone.prototype.setAbsolutePosition = function (position, tNode) {
        this.setPosition(position, Space.WORLD, tNode);
    };
    /**
     * Scale the bone on the x, y and z axes (in local space)
     * @param x The amount to scale the bone on the x axis
     * @param y The amount to scale the bone on the y axis
     * @param z The amount to scale the bone on the z axis
     * @param scaleChildren sets this to true if children of the bone should be scaled as well (false by default)
     */
    Bone.prototype.scale = function (x, y, z, scaleChildren) {
        if (scaleChildren === void 0) { scaleChildren = false; }
        var locMat = this.getLocalMatrix();
        // Apply new scaling on top of current local matrix
        var scaleMat = Bone._TmpMats[0];
        Matrix.ScalingToRef(x, y, z, scaleMat);
        scaleMat.multiplyToRef(locMat, locMat);
        // Invert scaling matrix and apply the inverse to all children
        scaleMat.invert();
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var cm = child.getLocalMatrix();
            cm.multiplyToRef(scaleMat, cm);
            cm.multiplyAtIndex(12, x);
            cm.multiplyAtIndex(13, y);
            cm.multiplyAtIndex(14, z);
            child._markAsDirtyAndDecompose();
        }
        this._markAsDirtyAndDecompose();
        if (scaleChildren) {
            for (var _b = 0, _c = this.children; _b < _c.length; _b++) {
                var child = _c[_b];
                child.scale(x, y, z, scaleChildren);
            }
        }
    };
    /**
     * Set the bone scaling in local space
     * @param scale defines the scaling vector
     */
    Bone.prototype.setScale = function (scale) {
        this._decompose();
        this._localScaling.copyFrom(scale);
        this._markAsDirtyAndCompose();
    };
    /**
     * Gets the current scaling in local space
     * @returns the current scaling vector
     */
    Bone.prototype.getScale = function () {
        this._decompose();
        return this._localScaling;
    };
    /**
     * Gets the current scaling in local space and stores it in a target vector
     * @param result defines the target vector
     */
    Bone.prototype.getScaleToRef = function (result) {
        this._decompose();
        result.copyFrom(this._localScaling);
    };
    /**
     * Set the yaw, pitch, and roll of the bone in local or world space
     * @param yaw The rotation of the bone on the y axis
     * @param pitch The rotation of the bone on the x axis
     * @param roll The rotation of the bone on the z axis
     * @param space The space that the axes of rotation are in
     * @param tNode The TransformNode that this bone is attached to.  This is only used in world space
     */
    Bone.prototype.setYawPitchRoll = function (yaw, pitch, roll, space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space === Space.LOCAL) {
            var quat = Bone._TmpQuat;
            Quaternion.RotationYawPitchRollToRef(yaw, pitch, roll, quat);
            this.setRotationQuaternion(quat, space, tNode);
            return;
        }
        var rotMatInv = Bone._TmpMats[0];
        if (!this._getNegativeRotationToRef(rotMatInv, tNode)) {
            return;
        }
        var rotMat = Bone._TmpMats[1];
        Matrix.RotationYawPitchRollToRef(yaw, pitch, roll, rotMat);
        rotMatInv.multiplyToRef(rotMat, rotMat);
        this._rotateWithMatrix(rotMat, space, tNode);
    };
    /**
     * Add a rotation to the bone on an axis in local or world space
     * @param axis The axis to rotate the bone on
     * @param amount The amount to rotate the bone
     * @param space The space that the axis is in
     * @param tNode The TransformNode that this bone is attached to. This is only used in world space
     */
    Bone.prototype.rotate = function (axis, amount, space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        var rmat = Bone._TmpMats[0];
        rmat.setTranslationFromFloats(0, 0, 0);
        Matrix.RotationAxisToRef(axis, amount, rmat);
        this._rotateWithMatrix(rmat, space, tNode);
    };
    /**
     * Set the rotation of the bone to a particular axis angle in local or world space
     * @param axis The axis to rotate the bone on
     * @param angle The angle that the bone should be rotated to
     * @param space The space that the axis is in
     * @param tNode The TransformNode that this bone is attached to.  This is only used in world space
     */
    Bone.prototype.setAxisAngle = function (axis, angle, space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space === Space.LOCAL) {
            var quat = Bone._TmpQuat;
            Quaternion.RotationAxisToRef(axis, angle, quat);
            this.setRotationQuaternion(quat, space, tNode);
            return;
        }
        var rotMatInv = Bone._TmpMats[0];
        if (!this._getNegativeRotationToRef(rotMatInv, tNode)) {
            return;
        }
        var rotMat = Bone._TmpMats[1];
        Matrix.RotationAxisToRef(axis, angle, rotMat);
        rotMatInv.multiplyToRef(rotMat, rotMat);
        this._rotateWithMatrix(rotMat, space, tNode);
    };
    /**
     * Set the euler rotation of the bone in local or world space
     * @param rotation The euler rotation that the bone should be set to
     * @param space The space that the rotation is in
     * @param tNode The TransformNode that this bone is attached to. This is only used in world space
     */
    Bone.prototype.setRotation = function (rotation, space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        this.setYawPitchRoll(rotation.y, rotation.x, rotation.z, space, tNode);
    };
    /**
     * Set the quaternion rotation of the bone in local or world space
     * @param quat The quaternion rotation that the bone should be set to
     * @param space The space that the rotation is in
     * @param tNode The TransformNode that this bone is attached to. This is only used in world space
     */
    Bone.prototype.setRotationQuaternion = function (quat, space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space === Space.LOCAL) {
            this._decompose();
            this._localRotation.copyFrom(quat);
            this._markAsDirtyAndCompose();
            return;
        }
        var rotMatInv = Bone._TmpMats[0];
        if (!this._getNegativeRotationToRef(rotMatInv, tNode)) {
            return;
        }
        var rotMat = Bone._TmpMats[1];
        Matrix.FromQuaternionToRef(quat, rotMat);
        rotMatInv.multiplyToRef(rotMat, rotMat);
        this._rotateWithMatrix(rotMat, space, tNode);
    };
    /**
     * Set the rotation matrix of the bone in local or world space
     * @param rotMat The rotation matrix that the bone should be set to
     * @param space The space that the rotation is in
     * @param tNode The TransformNode that this bone is attached to. This is only used in world space
     */
    Bone.prototype.setRotationMatrix = function (rotMat, space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space === Space.LOCAL) {
            var quat = Bone._TmpQuat;
            Quaternion.FromRotationMatrixToRef(rotMat, quat);
            this.setRotationQuaternion(quat, space, tNode);
            return;
        }
        var rotMatInv = Bone._TmpMats[0];
        if (!this._getNegativeRotationToRef(rotMatInv, tNode)) {
            return;
        }
        var rotMat2 = Bone._TmpMats[1];
        rotMat2.copyFrom(rotMat);
        rotMatInv.multiplyToRef(rotMat, rotMat2);
        this._rotateWithMatrix(rotMat2, space, tNode);
    };
    Bone.prototype._rotateWithMatrix = function (rmat, space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        var lmat = this.getLocalMatrix();
        var lx = lmat.m[12];
        var ly = lmat.m[13];
        var lz = lmat.m[14];
        var parent = this.getParent();
        var parentScale = Bone._TmpMats[3];
        var parentScaleInv = Bone._TmpMats[4];
        if (parent && space == Space.WORLD) {
            if (tNode) {
                parentScale.copyFrom(tNode.getWorldMatrix());
                parent.getAbsoluteTransform().multiplyToRef(parentScale, parentScale);
            }
            else {
                parentScale.copyFrom(parent.getAbsoluteTransform());
            }
            parentScaleInv.copyFrom(parentScale);
            parentScaleInv.invert();
            lmat.multiplyToRef(parentScale, lmat);
            lmat.multiplyToRef(rmat, lmat);
            lmat.multiplyToRef(parentScaleInv, lmat);
        }
        else {
            if (space == Space.WORLD && tNode) {
                parentScale.copyFrom(tNode.getWorldMatrix());
                parentScaleInv.copyFrom(parentScale);
                parentScaleInv.invert();
                lmat.multiplyToRef(parentScale, lmat);
                lmat.multiplyToRef(rmat, lmat);
                lmat.multiplyToRef(parentScaleInv, lmat);
            }
            else {
                lmat.multiplyToRef(rmat, lmat);
            }
        }
        lmat.setTranslationFromFloats(lx, ly, lz);
        this.computeAbsoluteTransforms();
        this._markAsDirtyAndDecompose();
    };
    Bone.prototype._getNegativeRotationToRef = function (rotMatInv, tNode) {
        var scaleMatrix = Bone._TmpMats[2];
        rotMatInv.copyFrom(this.getAbsoluteTransform());
        if (tNode) {
            rotMatInv.multiplyToRef(tNode.getWorldMatrix(), rotMatInv);
            Matrix.ScalingToRef(tNode.scaling.x, tNode.scaling.y, tNode.scaling.z, scaleMatrix);
        }
        else {
            Matrix.IdentityToRef(scaleMatrix);
        }
        rotMatInv.invert();
        if (isNaN(rotMatInv.m[0])) {
            // Matrix failed to invert.
            // This can happen if scale is zero for example.
            return false;
        }
        scaleMatrix.multiplyAtIndex(0, this._scalingDeterminant);
        rotMatInv.multiplyToRef(scaleMatrix, rotMatInv);
        return true;
    };
    /**
     * Get the position of the bone in local or world space
     * @param space The space that the returned position is in
     * @param tNode The TransformNode that this bone is attached to. This is only used in world space
     * @returns The position of the bone
     */
    Bone.prototype.getPosition = function (space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        if (tNode === void 0) { tNode = null; }
        var pos = Vector3.Zero();
        this.getPositionToRef(space, tNode, pos);
        return pos;
    };
    /**
     * Copy the position of the bone to a vector3 in local or world space
     * @param space The space that the returned position is in
     * @param tNode The TransformNode that this bone is attached to. This is only used in world space
     * @param result The vector3 to copy the position to
     */
    Bone.prototype.getPositionToRef = function (space, tNode, result) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space == Space.LOCAL) {
            var lm = this.getLocalMatrix();
            result.x = lm.m[12];
            result.y = lm.m[13];
            result.z = lm.m[14];
        }
        else {
            var wm = null;
            //tNode.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
            if (tNode) {
                wm = tNode.getWorldMatrix();
            }
            this._skeleton.computeAbsoluteTransforms();
            var tmat = Bone._TmpMats[0];
            if (tNode && wm) {
                tmat.copyFrom(this.getAbsoluteTransform());
                tmat.multiplyToRef(wm, tmat);
            }
            else {
                tmat = this.getAbsoluteTransform();
            }
            result.x = tmat.m[12];
            result.y = tmat.m[13];
            result.z = tmat.m[14];
        }
    };
    /**
     * Get the absolute position of the bone (world space)
     * @param tNode The TransformNode that this bone is attached to
     * @returns The absolute position of the bone
     */
    Bone.prototype.getAbsolutePosition = function (tNode) {
        if (tNode === void 0) { tNode = null; }
        var pos = Vector3.Zero();
        this.getPositionToRef(Space.WORLD, tNode, pos);
        return pos;
    };
    /**
     * Copy the absolute position of the bone (world space) to the result param
     * @param tNode The TransformNode that this bone is attached to
     * @param result The vector3 to copy the absolute position to
     */
    Bone.prototype.getAbsolutePositionToRef = function (tNode, result) {
        this.getPositionToRef(Space.WORLD, tNode, result);
    };
    /**
     * Compute the absolute transforms of this bone and its children
     */
    Bone.prototype.computeAbsoluteTransforms = function () {
        this._compose();
        if (this.parent) {
            this._localMatrix.multiplyToRef(this.parent._absoluteTransform, this._absoluteTransform);
        }
        else {
            this._absoluteTransform.copyFrom(this._localMatrix);
            var poseMatrix = this._skeleton.getPoseMatrix();
            if (poseMatrix) {
                this._absoluteTransform.multiplyToRef(poseMatrix, this._absoluteTransform);
            }
        }
        var children = this.children;
        var len = children.length;
        for (var i = 0; i < len; i++) {
            children[i].computeAbsoluteTransforms();
        }
    };
    /**
     * Get the world direction from an axis that is in the local space of the bone
     * @param localAxis The local direction that is used to compute the world direction
     * @param tNode The TransformNode that this bone is attached to
     * @returns The world direction
     */
    Bone.prototype.getDirection = function (localAxis, tNode) {
        if (tNode === void 0) { tNode = null; }
        var result = Vector3.Zero();
        this.getDirectionToRef(localAxis, tNode, result);
        return result;
    };
    /**
     * Copy the world direction to a vector3 from an axis that is in the local space of the bone
     * @param localAxis The local direction that is used to compute the world direction
     * @param tNode The TransformNode that this bone is attached to
     * @param result The vector3 that the world direction will be copied to
     */
    Bone.prototype.getDirectionToRef = function (localAxis, tNode, result) {
        if (tNode === void 0) { tNode = null; }
        var wm = null;
        //tNode.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
        if (tNode) {
            wm = tNode.getWorldMatrix();
        }
        this._skeleton.computeAbsoluteTransforms();
        var mat = Bone._TmpMats[0];
        mat.copyFrom(this.getAbsoluteTransform());
        if (tNode && wm) {
            mat.multiplyToRef(wm, mat);
        }
        Vector3.TransformNormalToRef(localAxis, mat, result);
        result.normalize();
    };
    /**
     * Get the euler rotation of the bone in local or world space
     * @param space The space that the rotation should be in
     * @param tNode The TransformNode that this bone is attached to.  This is only used in world space
     * @returns The euler rotation
     */
    Bone.prototype.getRotation = function (space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        if (tNode === void 0) { tNode = null; }
        var result = Vector3.Zero();
        this.getRotationToRef(space, tNode, result);
        return result;
    };
    /**
     * Copy the euler rotation of the bone to a vector3.  The rotation can be in either local or world space
     * @param space The space that the rotation should be in
     * @param tNode The TransformNode that this bone is attached to.  This is only used in world space
     * @param result The vector3 that the rotation should be copied to
     */
    Bone.prototype.getRotationToRef = function (space, tNode, result) {
        if (space === void 0) { space = Space.LOCAL; }
        if (tNode === void 0) { tNode = null; }
        var quat = Bone._TmpQuat;
        this.getRotationQuaternionToRef(space, tNode, quat);
        quat.toEulerAnglesToRef(result);
    };
    /**
     * Get the quaternion rotation of the bone in either local or world space
     * @param space The space that the rotation should be in
     * @param tNode The TransformNode that this bone is attached to.  This is only used in world space
     * @returns The quaternion rotation
     */
    Bone.prototype.getRotationQuaternion = function (space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        if (tNode === void 0) { tNode = null; }
        var result = Quaternion.Identity();
        this.getRotationQuaternionToRef(space, tNode, result);
        return result;
    };
    /**
     * Copy the quaternion rotation of the bone to a quaternion.  The rotation can be in either local or world space
     * @param space The space that the rotation should be in
     * @param tNode The TransformNode that this bone is attached to.  This is only used in world space
     * @param result The quaternion that the rotation should be copied to
     */
    Bone.prototype.getRotationQuaternionToRef = function (space, tNode, result) {
        if (space === void 0) { space = Space.LOCAL; }
        if (tNode === void 0) { tNode = null; }
        if (space == Space.LOCAL) {
            this._decompose();
            result.copyFrom(this._localRotation);
        }
        else {
            var mat = Bone._TmpMats[0];
            var amat = this.getAbsoluteTransform();
            if (tNode) {
                amat.multiplyToRef(tNode.getWorldMatrix(), mat);
            }
            else {
                mat.copyFrom(amat);
            }
            mat.multiplyAtIndex(0, this._scalingDeterminant);
            mat.multiplyAtIndex(1, this._scalingDeterminant);
            mat.multiplyAtIndex(2, this._scalingDeterminant);
            mat.decompose(undefined, result, undefined);
        }
    };
    /**
     * Get the rotation matrix of the bone in local or world space
     * @param space The space that the rotation should be in
     * @param tNode The TransformNode that this bone is attached to.  This is only used in world space
     * @returns The rotation matrix
     */
    Bone.prototype.getRotationMatrix = function (space, tNode) {
        if (space === void 0) { space = Space.LOCAL; }
        var result = Matrix.Identity();
        this.getRotationMatrixToRef(space, tNode, result);
        return result;
    };
    /**
     * Copy the rotation matrix of the bone to a matrix.  The rotation can be in either local or world space
     * @param space The space that the rotation should be in
     * @param tNode The TransformNode that this bone is attached to.  This is only used in world space
     * @param result The quaternion that the rotation should be copied to
     */
    Bone.prototype.getRotationMatrixToRef = function (space, tNode, result) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space == Space.LOCAL) {
            this.getLocalMatrix().getRotationMatrixToRef(result);
        }
        else {
            var mat = Bone._TmpMats[0];
            var amat = this.getAbsoluteTransform();
            if (tNode) {
                amat.multiplyToRef(tNode.getWorldMatrix(), mat);
            }
            else {
                mat.copyFrom(amat);
            }
            mat.multiplyAtIndex(0, this._scalingDeterminant);
            mat.multiplyAtIndex(1, this._scalingDeterminant);
            mat.multiplyAtIndex(2, this._scalingDeterminant);
            mat.getRotationMatrixToRef(result);
        }
    };
    /**
     * Get the world position of a point that is in the local space of the bone
     * @param position The local position
     * @param tNode The TransformNode that this bone is attached to
     * @returns The world position
     */
    Bone.prototype.getAbsolutePositionFromLocal = function (position, tNode) {
        if (tNode === void 0) { tNode = null; }
        var result = Vector3.Zero();
        this.getAbsolutePositionFromLocalToRef(position, tNode, result);
        return result;
    };
    /**
     * Get the world position of a point that is in the local space of the bone and copy it to the result param
     * @param position The local position
     * @param tNode The TransformNode that this bone is attached to
     * @param result The vector3 that the world position should be copied to
     */
    Bone.prototype.getAbsolutePositionFromLocalToRef = function (position, tNode, result) {
        if (tNode === void 0) { tNode = null; }
        var wm = null;
        //tNode.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
        if (tNode) {
            wm = tNode.getWorldMatrix();
        }
        this._skeleton.computeAbsoluteTransforms();
        var tmat = Bone._TmpMats[0];
        if (tNode && wm) {
            tmat.copyFrom(this.getAbsoluteTransform());
            tmat.multiplyToRef(wm, tmat);
        }
        else {
            tmat = this.getAbsoluteTransform();
        }
        Vector3.TransformCoordinatesToRef(position, tmat, result);
    };
    /**
     * Get the local position of a point that is in world space
     * @param position The world position
     * @param tNode The TransformNode that this bone is attached to
     * @returns The local position
     */
    Bone.prototype.getLocalPositionFromAbsolute = function (position, tNode) {
        if (tNode === void 0) { tNode = null; }
        var result = Vector3.Zero();
        this.getLocalPositionFromAbsoluteToRef(position, tNode, result);
        return result;
    };
    /**
     * Get the local position of a point that is in world space and copy it to the result param
     * @param position The world position
     * @param tNode The TransformNode that this bone is attached to
     * @param result The vector3 that the local position should be copied to
     */
    Bone.prototype.getLocalPositionFromAbsoluteToRef = function (position, tNode, result) {
        if (tNode === void 0) { tNode = null; }
        var wm = null;
        //tNode.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
        if (tNode) {
            wm = tNode.getWorldMatrix();
        }
        this._skeleton.computeAbsoluteTransforms();
        var tmat = Bone._TmpMats[0];
        tmat.copyFrom(this.getAbsoluteTransform());
        if (tNode && wm) {
            tmat.multiplyToRef(wm, tmat);
        }
        tmat.invert();
        Vector3.TransformCoordinatesToRef(position, tmat, result);
    };
    /**
     * Set the current local matrix as the restPose for this bone.
     */
    Bone.prototype.setCurrentPoseAsRest = function () {
        this.setRestPose(this.getLocalMatrix());
    };
    Bone._TmpVecs = ArrayTools.BuildArray(2, Vector3.Zero);
    Bone._TmpQuat = Quaternion.Identity();
    Bone._TmpMats = ArrayTools.BuildArray(5, Matrix.Identity);
    return Bone;
}(Node));
export { Bone };
//# sourceMappingURL=bone.js.map