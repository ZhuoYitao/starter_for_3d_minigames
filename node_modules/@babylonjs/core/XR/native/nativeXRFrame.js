import { RegisterNativeTypeAsync } from "../../Engines/nativeEngine.js";
/** @hidden */
var NativeXRFrame = /** @class */ (function () {
    function NativeXRFrame(_nativeImpl) {
        var _this = this;
        this._nativeImpl = _nativeImpl;
        this._xrTransform = new XRRigidTransform();
        this._xrPose = {
            transform: this._xrTransform,
            emulatedPosition: false,
        };
        // Enough space for position, orientation
        this._xrPoseVectorData = new Float32Array(4 + 4);
        this.fillPoses = this._nativeImpl.fillPoses.bind(this._nativeImpl);
        this.getViewerPose = this._nativeImpl.getViewerPose.bind(this._nativeImpl);
        this.getHitTestResults = this._nativeImpl.getHitTestResults.bind(this._nativeImpl);
        this.getHitTestResultsForTransientInput = function () {
            throw new Error("XRFrame.getHitTestResultsForTransientInput not supported on native.");
        };
        this.createAnchor = this._nativeImpl.createAnchor.bind(this._nativeImpl);
        this.getJointPose = this._nativeImpl.getJointPose.bind(this._nativeImpl);
        this.fillJointRadii = this._nativeImpl.fillJointRadii.bind(this._nativeImpl);
        this.getLightEstimate = function () {
            throw new Error("XRFrame.getLightEstimate not supported on native.");
        };
        this.getImageTrackingResults = function () {
            var _a;
            return (_a = _this._nativeImpl._imageTrackingResults) !== null && _a !== void 0 ? _a : [];
        };
    }
    Object.defineProperty(NativeXRFrame.prototype, "session", {
        get: function () {
            return this._nativeImpl.session;
        },
        enumerable: false,
        configurable: true
    });
    NativeXRFrame.prototype.getPose = function (space, baseSpace) {
        if (!this._nativeImpl.getPoseData(space, baseSpace, this._xrPoseVectorData.buffer, this._xrTransform.matrix.buffer)) {
            return undefined;
        }
        var position = this._xrTransform.position;
        position.x = this._xrPoseVectorData[0];
        position.y = this._xrPoseVectorData[1];
        position.z = this._xrPoseVectorData[2];
        position.w = this._xrPoseVectorData[3];
        var orientation = this._xrTransform.orientation;
        orientation.x = this._xrPoseVectorData[4];
        orientation.y = this._xrPoseVectorData[5];
        orientation.z = this._xrPoseVectorData[6];
        orientation.w = this._xrPoseVectorData[7];
        return this._xrPose;
    };
    Object.defineProperty(NativeXRFrame.prototype, "trackedAnchors", {
        get: function () {
            return this._nativeImpl.trackedAnchors;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NativeXRFrame.prototype, "worldInformation", {
        get: function () {
            return this._nativeImpl.worldInformation;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NativeXRFrame.prototype, "detectedPlanes", {
        get: function () {
            return this._nativeImpl.detectedPlanes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NativeXRFrame.prototype, "featurePointCloud", {
        get: function () {
            return this._nativeImpl.featurePointCloud;
        },
        enumerable: false,
        configurable: true
    });
    return NativeXRFrame;
}());
export { NativeXRFrame };
RegisterNativeTypeAsync("NativeXRFrame", NativeXRFrame);
//# sourceMappingURL=nativeXRFrame.js.map