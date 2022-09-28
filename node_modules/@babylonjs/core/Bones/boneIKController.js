import { Vector3, Quaternion, Matrix } from "../Maths/math.vector.js";
import { Space } from "../Maths/math.axis.js";
/**
 * Class used to apply inverse kinematics to bones
 * @see https://doc.babylonjs.com/how_to/how_to_use_bones_and_skeletons#boneikcontroller
 */
var BoneIKController = /** @class */ (function () {
    /**
     * Creates a new BoneIKController
     * @param mesh defines the TransformNode to control
     * @param bone defines the bone to control
     * @param options defines options to set up the controller
     * @param options.targetMesh
     * @param options.poleTargetMesh
     * @param options.poleTargetBone
     * @param options.poleTargetLocalOffset
     * @param options.poleAngle
     * @param options.bendAxis
     * @param options.maxAngle
     * @param options.slerpAmount
     */
    function BoneIKController(mesh, bone, options) {
        /**
         * Gets or sets the target position
         */
        this.targetPosition = Vector3.Zero();
        /**
         * Gets or sets the pole target position
         */
        this.poleTargetPosition = Vector3.Zero();
        /**
         * Gets or sets the pole target local offset
         */
        this.poleTargetLocalOffset = Vector3.Zero();
        /**
         * Gets or sets the pole angle
         */
        this.poleAngle = 0;
        /**
         * The amount to slerp (spherical linear interpolation) to the target.  Set this to a value between 0 and 1 (a value of 1 disables slerp)
         */
        this.slerpAmount = 1;
        this._bone1Quat = Quaternion.Identity();
        this._bone1Mat = Matrix.Identity();
        this._bone2Ang = Math.PI;
        this._maxAngle = Math.PI;
        this._rightHandedSystem = false;
        this._bendAxis = Vector3.Right();
        this._slerping = false;
        this._adjustRoll = 0;
        this._bone2 = bone;
        this._bone1 = bone.getParent();
        if (!this._bone1) {
            return;
        }
        this.mesh = mesh;
        var bonePos = bone.getPosition();
        if (bone.getAbsoluteTransform().determinant() > 0) {
            this._rightHandedSystem = true;
            this._bendAxis.x = 0;
            this._bendAxis.y = 0;
            this._bendAxis.z = -1;
            if (bonePos.x > bonePos.y && bonePos.x > bonePos.z) {
                this._adjustRoll = Math.PI * 0.5;
                this._bendAxis.z = 1;
            }
        }
        if (this._bone1.length) {
            var boneScale1 = this._bone1.getScale();
            var boneScale2 = this._bone2.getScale();
            this._bone1Length = this._bone1.length * boneScale1.y * this.mesh.scaling.y;
            this._bone2Length = this._bone2.length * boneScale2.y * this.mesh.scaling.y;
        }
        else if (this._bone1.children[0]) {
            mesh.computeWorldMatrix(true);
            var pos1 = this._bone2.children[0].getAbsolutePosition(mesh);
            var pos2 = this._bone2.getAbsolutePosition(mesh);
            var pos3 = this._bone1.getAbsolutePosition(mesh);
            this._bone1Length = Vector3.Distance(pos1, pos2);
            this._bone2Length = Vector3.Distance(pos2, pos3);
        }
        this._bone1.getRotationMatrixToRef(Space.WORLD, mesh, this._bone1Mat);
        this.maxAngle = Math.PI;
        if (options) {
            if (options.targetMesh) {
                this.targetMesh = options.targetMesh;
                this.targetMesh.computeWorldMatrix(true);
            }
            if (options.poleTargetMesh) {
                this.poleTargetMesh = options.poleTargetMesh;
                this.poleTargetMesh.computeWorldMatrix(true);
            }
            else if (options.poleTargetBone) {
                this.poleTargetBone = options.poleTargetBone;
            }
            else if (this._bone1.getParent()) {
                this.poleTargetBone = this._bone1.getParent();
            }
            if (options.poleTargetLocalOffset) {
                this.poleTargetLocalOffset.copyFrom(options.poleTargetLocalOffset);
            }
            if (options.poleAngle) {
                this.poleAngle = options.poleAngle;
            }
            if (options.bendAxis) {
                this._bendAxis.copyFrom(options.bendAxis);
            }
            if (options.maxAngle) {
                this.maxAngle = options.maxAngle;
            }
            if (options.slerpAmount) {
                this.slerpAmount = options.slerpAmount;
            }
        }
    }
    Object.defineProperty(BoneIKController.prototype, "maxAngle", {
        /**
         * Gets or sets maximum allowed angle
         */
        get: function () {
            return this._maxAngle;
        },
        set: function (value) {
            this._setMaxAngle(value);
        },
        enumerable: false,
        configurable: true
    });
    BoneIKController.prototype._setMaxAngle = function (ang) {
        if (ang < 0) {
            ang = 0;
        }
        if (ang > Math.PI || ang == undefined) {
            ang = Math.PI;
        }
        this._maxAngle = ang;
        var a = this._bone1Length;
        var b = this._bone2Length;
        this._maxReach = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(ang));
    };
    /**
     * Force the controller to update the bones
     */
    BoneIKController.prototype.update = function () {
        var bone1 = this._bone1;
        if (!bone1) {
            return;
        }
        var target = this.targetPosition;
        var poleTarget = this.poleTargetPosition;
        var mat1 = BoneIKController._TmpMats[0];
        var mat2 = BoneIKController._TmpMats[1];
        if (this.targetMesh) {
            target.copyFrom(this.targetMesh.getAbsolutePosition());
        }
        if (this.poleTargetBone) {
            this.poleTargetBone.getAbsolutePositionFromLocalToRef(this.poleTargetLocalOffset, this.mesh, poleTarget);
        }
        else if (this.poleTargetMesh) {
            Vector3.TransformCoordinatesToRef(this.poleTargetLocalOffset, this.poleTargetMesh.getWorldMatrix(), poleTarget);
        }
        var bonePos = BoneIKController._TmpVecs[0];
        var zaxis = BoneIKController._TmpVecs[1];
        var xaxis = BoneIKController._TmpVecs[2];
        var yaxis = BoneIKController._TmpVecs[3];
        var upAxis = BoneIKController._TmpVecs[4];
        var tmpQuat = BoneIKController._TmpQuat;
        bone1.getAbsolutePositionToRef(this.mesh, bonePos);
        poleTarget.subtractToRef(bonePos, upAxis);
        if (upAxis.x == 0 && upAxis.y == 0 && upAxis.z == 0) {
            upAxis.y = 1;
        }
        else {
            upAxis.normalize();
        }
        target.subtractToRef(bonePos, yaxis);
        yaxis.normalize();
        Vector3.CrossToRef(yaxis, upAxis, zaxis);
        zaxis.normalize();
        Vector3.CrossToRef(yaxis, zaxis, xaxis);
        xaxis.normalize();
        Matrix.FromXYZAxesToRef(xaxis, yaxis, zaxis, mat1);
        var a = this._bone1Length;
        var b = this._bone2Length;
        var c = Vector3.Distance(bonePos, target);
        if (this._maxReach > 0) {
            c = Math.min(this._maxReach, c);
        }
        var acosa = (b * b + c * c - a * a) / (2 * b * c);
        var acosb = (c * c + a * a - b * b) / (2 * c * a);
        if (acosa > 1) {
            acosa = 1;
        }
        if (acosb > 1) {
            acosb = 1;
        }
        if (acosa < -1) {
            acosa = -1;
        }
        if (acosb < -1) {
            acosb = -1;
        }
        var angA = Math.acos(acosa);
        var angB = Math.acos(acosb);
        var angC = -angA - angB;
        if (this._rightHandedSystem) {
            Matrix.RotationYawPitchRollToRef(0, 0, this._adjustRoll, mat2);
            mat2.multiplyToRef(mat1, mat1);
            Matrix.RotationAxisToRef(this._bendAxis, angB, mat2);
            mat2.multiplyToRef(mat1, mat1);
        }
        else {
            var _tmpVec = BoneIKController._TmpVecs[5];
            _tmpVec.copyFrom(this._bendAxis);
            _tmpVec.x *= -1;
            Matrix.RotationAxisToRef(_tmpVec, -angB, mat2);
            mat2.multiplyToRef(mat1, mat1);
        }
        if (this.poleAngle) {
            Matrix.RotationAxisToRef(yaxis, this.poleAngle, mat2);
            mat1.multiplyToRef(mat2, mat1);
        }
        if (this._bone1) {
            if (this.slerpAmount < 1) {
                if (!this._slerping) {
                    Quaternion.FromRotationMatrixToRef(this._bone1Mat, this._bone1Quat);
                }
                Quaternion.FromRotationMatrixToRef(mat1, tmpQuat);
                Quaternion.SlerpToRef(this._bone1Quat, tmpQuat, this.slerpAmount, this._bone1Quat);
                angC = this._bone2Ang * (1.0 - this.slerpAmount) + angC * this.slerpAmount;
                this._bone1.setRotationQuaternion(this._bone1Quat, Space.WORLD, this.mesh);
                this._slerping = true;
            }
            else {
                this._bone1.setRotationMatrix(mat1, Space.WORLD, this.mesh);
                this._bone1Mat.copyFrom(mat1);
                this._slerping = false;
            }
            this._updateLinkedTransformRotation(this._bone1);
        }
        this._bone2.setAxisAngle(this._bendAxis, angC, Space.LOCAL);
        this._updateLinkedTransformRotation(this._bone2);
        this._bone2Ang = angC;
    };
    BoneIKController.prototype._updateLinkedTransformRotation = function (bone) {
        if (bone._linkedTransformNode) {
            if (!bone._linkedTransformNode.rotationQuaternion) {
                bone._linkedTransformNode.rotationQuaternion = new Quaternion();
            }
            bone.getRotationQuaternionToRef(Space.LOCAL, null, bone._linkedTransformNode.rotationQuaternion);
        }
    };
    BoneIKController._TmpVecs = [Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero()];
    BoneIKController._TmpQuat = Quaternion.Identity();
    BoneIKController._TmpMats = [Matrix.Identity(), Matrix.Identity()];
    return BoneIKController;
}());
export { BoneIKController };
//# sourceMappingURL=boneIKController.js.map