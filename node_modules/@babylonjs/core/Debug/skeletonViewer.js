import { Vector3, Matrix, TmpVectors } from "../Maths/math.vector.js";
import { Color3, Color4 } from "../Maths/math.color.js";
import { Mesh } from "../Meshes/mesh.js";
import { CreateLineSystem } from "../Meshes/Builders/linesBuilder.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { Material } from "../Materials/material.js";
import { ShaderMaterial } from "../Materials/shaderMaterial.js";
import { DynamicTexture } from "../Materials/Textures/dynamicTexture.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Effect } from "../Materials/effect.js";
import { CreateSphere } from "../Meshes/Builders/sphereBuilder.js";
import { ExtrudeShapeCustom } from "../Meshes/Builders/shapeBuilder.js";
/**
 * Class used to render a debug view of a given skeleton
 * @see http://www.babylonjs-playground.com/#1BZJVJ#8
 */
var SkeletonViewer = /** @class */ (function () {
    /**
     * Creates a new SkeletonViewer
     * @param skeleton defines the skeleton to render
     * @param mesh defines the mesh attached to the skeleton
     * @param scene defines the hosting scene
     * @param autoUpdateBonesMatrices defines a boolean indicating if bones matrices must be forced to update before rendering (true by default)
     * @param renderingGroupId defines the rendering group id to use with the viewer
     * @param options All of the extra constructor options for the SkeletonViewer
     */
    function SkeletonViewer(
    /** defines the skeleton to render */
    skeleton, 
    /** defines the mesh attached to the skeleton */
    mesh, 
    /** The Scene scope*/
    scene, 
    /** defines a boolean indicating if bones matrices must be forced to update before rendering (true by default)  */
    autoUpdateBonesMatrices, 
    /** defines the rendering group id to use with the viewer */
    renderingGroupId, 
    /** is the options for the viewer */
    options) {
        if (autoUpdateBonesMatrices === void 0) { autoUpdateBonesMatrices = true; }
        if (renderingGroupId === void 0) { renderingGroupId = 3; }
        if (options === void 0) { options = {}; }
        var _a, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        this.skeleton = skeleton;
        this.mesh = mesh;
        this.autoUpdateBonesMatrices = autoUpdateBonesMatrices;
        this.renderingGroupId = renderingGroupId;
        this.options = options;
        /** Gets or sets the color used to render the skeleton */
        this.color = Color3.White();
        /** Array of the points of the skeleton fo the line view. */
        this._debugLines = new Array();
        /** The local axes Meshes. */
        this._localAxes = null;
        /** If SkeletonViewer is enabled. */
        this._isEnabled = true;
        /** SkeletonViewer render observable. */
        this._obs = null;
        this._scene = scene;
        this._ready = false;
        //Defaults
        options.pauseAnimations = (_a = options.pauseAnimations) !== null && _a !== void 0 ? _a : true;
        options.returnToRest = (_c = options.returnToRest) !== null && _c !== void 0 ? _c : false;
        options.displayMode = (_d = options.displayMode) !== null && _d !== void 0 ? _d : SkeletonViewer.DISPLAY_LINES;
        options.displayOptions = (_e = options.displayOptions) !== null && _e !== void 0 ? _e : {};
        options.displayOptions.midStep = (_f = options.displayOptions.midStep) !== null && _f !== void 0 ? _f : 0.235;
        options.displayOptions.midStepFactor = (_g = options.displayOptions.midStepFactor) !== null && _g !== void 0 ? _g : 0.155;
        options.displayOptions.sphereBaseSize = (_h = options.displayOptions.sphereBaseSize) !== null && _h !== void 0 ? _h : 0.15;
        options.displayOptions.sphereScaleUnit = (_j = options.displayOptions.sphereScaleUnit) !== null && _j !== void 0 ? _j : 2;
        options.displayOptions.sphereFactor = (_k = options.displayOptions.sphereFactor) !== null && _k !== void 0 ? _k : 0.865;
        options.displayOptions.spurFollowsChild = (_l = options.displayOptions.spurFollowsChild) !== null && _l !== void 0 ? _l : false;
        options.displayOptions.showLocalAxes = (_m = options.displayOptions.showLocalAxes) !== null && _m !== void 0 ? _m : false;
        options.displayOptions.localAxesSize = (_o = options.displayOptions.localAxesSize) !== null && _o !== void 0 ? _o : 0.075;
        options.computeBonesUsingShaders = (_p = options.computeBonesUsingShaders) !== null && _p !== void 0 ? _p : true;
        options.useAllBones = (_q = options.useAllBones) !== null && _q !== void 0 ? _q : true;
        var initialMeshBoneIndices = mesh.getVerticesData(VertexBuffer.MatricesIndicesKind);
        var initialMeshBoneWeights = mesh.getVerticesData(VertexBuffer.MatricesWeightsKind);
        this._boneIndices = new Set();
        if (!options.useAllBones) {
            if (initialMeshBoneIndices && initialMeshBoneWeights) {
                for (var i = 0; i < initialMeshBoneIndices.length; ++i) {
                    var index = initialMeshBoneIndices[i], weight = initialMeshBoneWeights[i];
                    if (weight !== 0) {
                        this._boneIndices.add(index);
                    }
                }
            }
        }
        /* Create Utility Layer */
        this._utilityLayer = new UtilityLayerRenderer(this._scene, false);
        this._utilityLayer.pickUtilitySceneFirst = false;
        this._utilityLayer.utilityLayerScene.autoClearDepthAndStencil = true;
        var displayMode = this.options.displayMode || 0;
        if (displayMode > SkeletonViewer.DISPLAY_SPHERE_AND_SPURS) {
            displayMode = SkeletonViewer.DISPLAY_LINES;
        }
        this.displayMode = displayMode;
        //Prep the Systems
        this.update();
        this._bindObs();
    }
    /** public static method to create a BoneWeight Shader
     * @param options The constructor options
     * @param scene The scene that the shader is scoped to
     * @returns The created ShaderMaterial
     * @see http://www.babylonjs-playground.com/#1BZJVJ#395
     */
    SkeletonViewer.CreateBoneWeightShader = function (options, scene) {
        var _a, _c, _d, _e, _f, _g;
        var skeleton = options.skeleton;
        var colorBase = (_a = options.colorBase) !== null && _a !== void 0 ? _a : Color3.Black();
        var colorZero = (_c = options.colorZero) !== null && _c !== void 0 ? _c : Color3.Blue();
        var colorQuarter = (_d = options.colorQuarter) !== null && _d !== void 0 ? _d : Color3.Green();
        var colorHalf = (_e = options.colorHalf) !== null && _e !== void 0 ? _e : Color3.Yellow();
        var colorFull = (_f = options.colorFull) !== null && _f !== void 0 ? _f : Color3.Red();
        var targetBoneIndex = (_g = options.targetBoneIndex) !== null && _g !== void 0 ? _g : 0;
        Effect.ShadersStore["boneWeights:" + skeleton.name + "VertexShader"] = "precision highp float;\n\n        attribute vec3 position;\n        attribute vec2 uv;\n\n        uniform mat4 view;\n        uniform mat4 projection;\n        uniform mat4 worldViewProjection;\n\n        #include<bonesDeclaration>\n        #if NUM_BONE_INFLUENCERS == 0\n            attribute vec4 matricesIndices;\n            attribute vec4 matricesWeights;\n        #endif\n        #include<bakedVertexAnimationDeclaration>\n\n        #include<instancesDeclaration>\n\n        varying vec3 vColor;\n\n        uniform vec3 colorBase;\n        uniform vec3 colorZero;\n        uniform vec3 colorQuarter;\n        uniform vec3 colorHalf;\n        uniform vec3 colorFull;\n\n        uniform float targetBoneIndex;\n\n        void main() {\n            vec3 positionUpdated = position;\n\n            #include<instancesVertex>\n            #include<bonesVertex>\n            #include<bakedVertexAnimation>\n\n            vec4 worldPos = finalWorld * vec4(positionUpdated, 1.0);\n\n            vec3 color = colorBase;\n            float totalWeight = 0.;\n            if(matricesIndices[0] == targetBoneIndex && matricesWeights[0] > 0.){\n                totalWeight += matricesWeights[0];\n            }\n            if(matricesIndices[1] == targetBoneIndex && matricesWeights[1] > 0.){\n                totalWeight += matricesWeights[1];\n            }\n            if(matricesIndices[2] == targetBoneIndex && matricesWeights[2] > 0.){\n                totalWeight += matricesWeights[2];\n            }\n            if(matricesIndices[3] == targetBoneIndex && matricesWeights[3] > 0.){\n                totalWeight += matricesWeights[3];\n            }\n\n            color = mix(color, colorZero, smoothstep(0., 0.25, totalWeight));\n            color = mix(color, colorQuarter, smoothstep(0.25, 0.5, totalWeight));\n            color = mix(color, colorHalf, smoothstep(0.5, 0.75, totalWeight));\n            color = mix(color, colorFull, smoothstep(0.75, 1.0, totalWeight));\n            vColor = color;\n\n        gl_Position = projection * view * worldPos;\n        }";
        Effect.ShadersStore["boneWeights:" + skeleton.name + "FragmentShader"] = "\n            precision highp float;\n            varying vec3 vPosition;\n\n            varying vec3 vColor;\n\n            void main() {\n                vec4 color = vec4(vColor, 1.0);\n                gl_FragColor = color;\n            }\n        ";
        var shader = new ShaderMaterial("boneWeight:" + skeleton.name, scene, {
            vertex: "boneWeights:" + skeleton.name,
            fragment: "boneWeights:" + skeleton.name,
        }, {
            attributes: ["position", "normal", "matricesIndices", "matricesWeights"],
            uniforms: [
                "world",
                "worldView",
                "worldViewProjection",
                "view",
                "projection",
                "viewProjection",
                "colorBase",
                "colorZero",
                "colorQuarter",
                "colorHalf",
                "colorFull",
                "targetBoneIndex",
            ],
        });
        shader.setColor3("colorBase", colorBase);
        shader.setColor3("colorZero", colorZero);
        shader.setColor3("colorQuarter", colorQuarter);
        shader.setColor3("colorHalf", colorHalf);
        shader.setColor3("colorFull", colorFull);
        shader.setFloat("targetBoneIndex", targetBoneIndex);
        shader.getClassName = function () {
            return "BoneWeightShader";
        };
        shader.transparencyMode = Material.MATERIAL_OPAQUE;
        return shader;
    };
    /** public static method to create a BoneWeight Shader
     * @param options The constructor options
     * @param scene The scene that the shader is scoped to
     * @returns The created ShaderMaterial
     */
    SkeletonViewer.CreateSkeletonMapShader = function (options, scene) {
        var _a;
        var skeleton = options.skeleton;
        var colorMap = (_a = options.colorMap) !== null && _a !== void 0 ? _a : [
            {
                color: new Color3(1, 0.38, 0.18),
                location: 0,
            },
            {
                color: new Color3(0.59, 0.18, 1.0),
                location: 0.2,
            },
            {
                color: new Color3(0.59, 1, 0.18),
                location: 0.4,
            },
            {
                color: new Color3(1, 0.87, 0.17),
                location: 0.6,
            },
            {
                color: new Color3(1, 0.17, 0.42),
                location: 0.8,
            },
            {
                color: new Color3(0.17, 0.68, 1.0),
                location: 1.0,
            },
        ];
        var bufferWidth = skeleton.bones.length + 1;
        var colorMapBuffer = SkeletonViewer._CreateBoneMapColorBuffer(bufferWidth, colorMap, scene);
        var shader = new ShaderMaterial("boneWeights:" + skeleton.name, scene, {
            vertexSource: "precision highp float;\n\n            attribute vec3 position;\n            attribute vec2 uv;\n\n            uniform mat4 view;\n            uniform mat4 projection;\n            uniform mat4 worldViewProjection;\n            uniform float colorMap[" +
                skeleton.bones.length * 4 +
                "];\n\n            #include<bonesDeclaration>\n            #if NUM_BONE_INFLUENCERS == 0\n                attribute vec4 matricesIndices;\n                attribute vec4 matricesWeights;\n            #endif\n            #include<bakedVertexAnimationDeclaration>\n            #include<instancesDeclaration>\n\n            varying vec3 vColor;\n\n            void main() {\n                vec3 positionUpdated = position;\n\n                #include<instancesVertex>\n                #include<bonesVertex>\n                #include<bakedVertexAnimation>\n\n                vec3 color = vec3(0.);\n                bool first = true;\n\n                for (int i = 0; i < 4; i++) {\n                    int boneIdx = int(matricesIndices[i]);\n                    float boneWgt = matricesWeights[i];\n\n                    vec3 c = vec3(colorMap[boneIdx * 4 + 0], colorMap[boneIdx * 4 + 1], colorMap[boneIdx * 4 + 2]);\n\n                    if (boneWgt > 0.) {\n                        if (first) {\n                            first = false;\n                            color = c;\n                        } else {\n                            color = mix(color, c, boneWgt);\n                        }\n                    }\n                }\n\n                vColor = color;\n\n                vec4 worldPos = finalWorld * vec4(positionUpdated, 1.0);\n\n                gl_Position = projection * view * worldPos;\n            }",
            fragmentSource: "\n            precision highp float;\n            varying vec3 vColor;\n\n            void main() {\n                vec4 color = vec4( vColor, 1.0 );\n                gl_FragColor = color;\n            }\n            ",
        }, {
            attributes: ["position", "normal", "matricesIndices", "matricesWeights"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "viewProjection", "colorMap"],
        });
        shader.setFloats("colorMap", colorMapBuffer);
        shader.getClassName = function () {
            return "SkeletonMapShader";
        };
        shader.transparencyMode = Material.MATERIAL_OPAQUE;
        return shader;
    };
    /** private static method to create a BoneWeight Shader
     * @param size The size of the buffer to create (usually the bone count)
     * @param colorMap The gradient data to generate
     * @param scene The scene that the shader is scoped to
     * @returns an Array of floats from the color gradient values
     */
    SkeletonViewer._CreateBoneMapColorBuffer = function (size, colorMap, scene) {
        var tempGrad = new DynamicTexture("temp", { width: size, height: 1 }, scene, false);
        var ctx = tempGrad.getContext();
        var grad = ctx.createLinearGradient(0, 0, size, 0);
        colorMap.forEach(function (stop) {
            grad.addColorStop(stop.location, stop.color.toHexString());
        });
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, 1);
        tempGrad.update();
        var buffer = [];
        var data = ctx.getImageData(0, 0, size, 1).data;
        var rUnit = 1 / 255;
        for (var i = 0; i < data.length; i++) {
            buffer.push(data[i] * rUnit);
        }
        tempGrad.dispose();
        return buffer;
    };
    Object.defineProperty(SkeletonViewer.prototype, "scene", {
        /** Gets the Scene. */
        get: function () {
            return this._scene;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SkeletonViewer.prototype, "utilityLayer", {
        /** Gets the utilityLayer. */
        get: function () {
            return this._utilityLayer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SkeletonViewer.prototype, "isReady", {
        /** Checks Ready Status. */
        get: function () {
            return this._ready;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SkeletonViewer.prototype, "ready", {
        /** Sets Ready Status. */
        set: function (value) {
            this._ready = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SkeletonViewer.prototype, "debugMesh", {
        /** Gets the debugMesh */
        get: function () {
            return this._debugMesh;
        },
        /** Sets the debugMesh */
        set: function (value) {
            this._debugMesh = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SkeletonViewer.prototype, "displayMode", {
        /** Gets the displayMode */
        get: function () {
            return this.options.displayMode || SkeletonViewer.DISPLAY_LINES;
        },
        /** Sets the displayMode */
        set: function (value) {
            if (value > SkeletonViewer.DISPLAY_SPHERE_AND_SPURS) {
                value = SkeletonViewer.DISPLAY_LINES;
            }
            this.options.displayMode = value;
        },
        enumerable: false,
        configurable: true
    });
    /** The Dynamic bindings for the update functions */
    SkeletonViewer.prototype._bindObs = function () {
        var _this = this;
        switch (this.displayMode) {
            case SkeletonViewer.DISPLAY_LINES: {
                this._obs = this.scene.onBeforeRenderObservable.add(function () {
                    _this._displayLinesUpdate();
                });
                break;
            }
        }
    };
    /** Update the viewer to sync with current skeleton state, only used to manually update. */
    SkeletonViewer.prototype.update = function () {
        switch (this.displayMode) {
            case SkeletonViewer.DISPLAY_LINES: {
                this._displayLinesUpdate();
                break;
            }
            case SkeletonViewer.DISPLAY_SPHERES: {
                this._buildSpheresAndSpurs(true);
                break;
            }
            case SkeletonViewer.DISPLAY_SPHERE_AND_SPURS: {
                this._buildSpheresAndSpurs(false);
                break;
            }
        }
        this._buildLocalAxes();
    };
    Object.defineProperty(SkeletonViewer.prototype, "isEnabled", {
        get: function () {
            return this._isEnabled;
        },
        /** Gets or sets a boolean indicating if the viewer is enabled */
        set: function (value) {
            if (this.isEnabled === value) {
                return;
            }
            this._isEnabled = value;
            if (this.debugMesh) {
                this.debugMesh.setEnabled(value);
            }
            if (value && !this._obs) {
                this._bindObs();
            }
            else if (!value && this._obs) {
                this.scene.onBeforeRenderObservable.remove(this._obs);
                this._obs = null;
            }
        },
        enumerable: false,
        configurable: true
    });
    SkeletonViewer.prototype._getBonePosition = function (position, bone, meshMat, x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        var tmat = TmpVectors.Matrix[0];
        var parentBone = bone.getParent();
        tmat.copyFrom(bone.getLocalMatrix());
        if (x !== 0 || y !== 0 || z !== 0) {
            var tmat2 = TmpVectors.Matrix[1];
            Matrix.IdentityToRef(tmat2);
            tmat2.setTranslationFromFloats(x, y, z);
            tmat2.multiplyToRef(tmat, tmat);
        }
        if (parentBone) {
            tmat.multiplyToRef(parentBone.getAbsoluteTransform(), tmat);
        }
        tmat.multiplyToRef(meshMat, tmat);
        position.x = tmat.m[12];
        position.y = tmat.m[13];
        position.z = tmat.m[14];
    };
    SkeletonViewer.prototype._getLinesForBonesWithLength = function (bones, meshMat) {
        var len = bones.length;
        var mesh = this.mesh;
        var meshPos = mesh.position;
        var idx = 0;
        for (var i = 0; i < len; i++) {
            var bone = bones[i];
            var points = this._debugLines[idx];
            if (bone._index === -1 || (!this._boneIndices.has(bone.getIndex()) && !this.options.useAllBones)) {
                continue;
            }
            if (!points) {
                points = [Vector3.Zero(), Vector3.Zero()];
                this._debugLines[idx] = points;
            }
            this._getBonePosition(points[0], bone, meshMat);
            this._getBonePosition(points[1], bone, meshMat, 0, bone.length, 0);
            points[0].subtractInPlace(meshPos);
            points[1].subtractInPlace(meshPos);
            idx++;
        }
    };
    SkeletonViewer.prototype._getLinesForBonesNoLength = function (bones) {
        var len = bones.length;
        var boneNum = 0;
        var mesh = this.mesh;
        var meshPos = mesh.position;
        for (var i = len - 1; i >= 0; i--) {
            var childBone = bones[i];
            var parentBone = childBone.getParent();
            if (!parentBone || (!this._boneIndices.has(childBone.getIndex()) && !this.options.useAllBones)) {
                continue;
            }
            var points = this._debugLines[boneNum];
            if (!points) {
                points = [Vector3.Zero(), Vector3.Zero()];
                this._debugLines[boneNum] = points;
            }
            childBone.getAbsolutePositionToRef(mesh, points[0]);
            parentBone.getAbsolutePositionToRef(mesh, points[1]);
            points[0].subtractInPlace(meshPos);
            points[1].subtractInPlace(meshPos);
            boneNum++;
        }
    };
    /**
     * function to revert the mesh and scene back to the initial state.
     * @param animationState
     */
    SkeletonViewer.prototype._revert = function (animationState) {
        if (this.options.pauseAnimations) {
            this.scene.animationsEnabled = animationState;
            this.utilityLayer.utilityLayerScene.animationsEnabled = animationState;
        }
    };
    /**
     * function to get the absolute bind pose of a bone by accumulating transformations up the bone hierarchy.
     * @param bone
     * @param matrix
     */
    SkeletonViewer.prototype._getAbsoluteBindPoseToRef = function (bone, matrix) {
        if (bone === null || bone._index === -1) {
            matrix.copyFrom(Matrix.Identity());
            return;
        }
        this._getAbsoluteBindPoseToRef(bone.getParent(), matrix);
        bone.getBaseMatrix().multiplyToRef(matrix, matrix);
        return;
    };
    /**
     * function to build and bind sphere joint points and spur bone representations.
     * @param spheresOnly
     */
    SkeletonViewer.prototype._buildSpheresAndSpurs = function (spheresOnly) {
        var _a, _c;
        if (spheresOnly === void 0) { spheresOnly = true; }
        if (this._debugMesh) {
            this._debugMesh.dispose();
            this._debugMesh = null;
            this.ready = false;
        }
        this._ready = false;
        var utilityLayerScene = (_a = this.utilityLayer) === null || _a === void 0 ? void 0 : _a.utilityLayerScene;
        var bones = this.skeleton.bones;
        var spheres = [];
        var spurs = [];
        var animationState = this.scene.animationsEnabled;
        try {
            if (this.options.pauseAnimations) {
                this.scene.animationsEnabled = false;
                utilityLayerScene.animationsEnabled = false;
            }
            if (this.options.returnToRest) {
                this.skeleton.returnToRest();
            }
            if (this.autoUpdateBonesMatrices) {
                this.skeleton.computeAbsoluteTransforms();
            }
            var longestBoneLength_1 = Number.NEGATIVE_INFINITY;
            var displayOptions_1 = this.options.displayOptions || {};
            var _loop_1 = function (i) {
                var bone = bones[i];
                if (bone._index === -1 || (!this_1._boneIndices.has(bone.getIndex()) && !this_1.options.useAllBones)) {
                    return "continue";
                }
                var boneAbsoluteBindPoseTransform = new Matrix();
                this_1._getAbsoluteBindPoseToRef(bone, boneAbsoluteBindPoseTransform);
                var anchorPoint = new Vector3();
                boneAbsoluteBindPoseTransform.decompose(undefined, undefined, anchorPoint);
                bone.children.forEach(function (bc) {
                    var childAbsoluteBindPoseTransform = new Matrix();
                    bc.getBaseMatrix().multiplyToRef(boneAbsoluteBindPoseTransform, childAbsoluteBindPoseTransform);
                    var childPoint = new Vector3();
                    childAbsoluteBindPoseTransform.decompose(undefined, undefined, childPoint);
                    var distanceFromParent = Vector3.Distance(anchorPoint, childPoint);
                    if (distanceFromParent > longestBoneLength_1) {
                        longestBoneLength_1 = distanceFromParent;
                    }
                    if (spheresOnly) {
                        return;
                    }
                    var dir = childPoint.clone().subtract(anchorPoint.clone());
                    var h = dir.length();
                    var up = dir.normalize().scale(h);
                    var midStep = displayOptions_1.midStep || 0.165;
                    var midStepFactor = displayOptions_1.midStepFactor || 0.215;
                    var up0 = up.scale(midStep);
                    var spur = ExtrudeShapeCustom("skeletonViewer", {
                        shape: [new Vector3(1, -1, 0), new Vector3(1, 1, 0), new Vector3(-1, 1, 0), new Vector3(-1, -1, 0), new Vector3(1, -1, 0)],
                        path: [Vector3.Zero(), up0, up],
                        scaleFunction: function (i) {
                            switch (i) {
                                case 0:
                                case 2:
                                    return 0;
                                case 1:
                                    return h * midStepFactor;
                            }
                            return 0;
                        },
                        sideOrientation: Mesh.DEFAULTSIDE,
                        updatable: false,
                    }, utilityLayerScene);
                    var numVertices = spur.getTotalVertices();
                    var mwk = [], mik = [];
                    for (var i_1 = 0; i_1 < numVertices; i_1++) {
                        mwk.push(1, 0, 0, 0);
                        // Select verts at end of spur (ie vert 10 to 14) and bind to child
                        // bone if spurFollowsChild is enabled.
                        if (displayOptions_1.spurFollowsChild && i_1 > 9) {
                            mik.push(bc.getIndex(), 0, 0, 0);
                        }
                        else {
                            mik.push(bone.getIndex(), 0, 0, 0);
                        }
                    }
                    spur.position = anchorPoint.clone();
                    spur.setVerticesData(VertexBuffer.MatricesWeightsKind, mwk, false);
                    spur.setVerticesData(VertexBuffer.MatricesIndicesKind, mik, false);
                    spur.convertToFlatShadedMesh();
                    spurs.push(spur);
                });
                var sphereBaseSize = displayOptions_1.sphereBaseSize || 0.2;
                var sphere = CreateSphere("skeletonViewer", {
                    segments: 6,
                    diameter: sphereBaseSize,
                    updatable: true,
                }, utilityLayerScene);
                var numVertices = sphere.getTotalVertices();
                var mwk = [], mik = [];
                for (var i_2 = 0; i_2 < numVertices; i_2++) {
                    mwk.push(1, 0, 0, 0);
                    mik.push(bone.getIndex(), 0, 0, 0);
                }
                sphere.setVerticesData(VertexBuffer.MatricesWeightsKind, mwk, false);
                sphere.setVerticesData(VertexBuffer.MatricesIndicesKind, mik, false);
                sphere.position = anchorPoint.clone();
                spheres.push([sphere, bone]);
            };
            var this_1 = this;
            for (var i = 0; i < bones.length; i++) {
                _loop_1(i);
            }
            var sphereScaleUnit = displayOptions_1.sphereScaleUnit || 2;
            var sphereFactor = displayOptions_1.sphereFactor || 0.85;
            var meshes = [];
            for (var i = 0; i < spheres.length; i++) {
                var _d = spheres[i], sphere = _d[0], bone = _d[1];
                var scale = 1 / (sphereScaleUnit / longestBoneLength_1);
                var _stepsOut = 0;
                var _b = bone;
                while (_b.getParent() && _b.getParent().getIndex() !== -1) {
                    _stepsOut++;
                    _b = _b.getParent();
                }
                sphere.scaling.scaleInPlace(scale * Math.pow(sphereFactor, _stepsOut));
                meshes.push(sphere);
            }
            this.debugMesh = Mesh.MergeMeshes(meshes.concat(spurs), true, true);
            if (this.debugMesh) {
                this.debugMesh.renderingGroupId = this.renderingGroupId;
                this.debugMesh.skeleton = this.skeleton;
                this.debugMesh.parent = this.mesh;
                this.debugMesh.computeBonesUsingShaders = (_c = this.options.computeBonesUsingShaders) !== null && _c !== void 0 ? _c : true;
                this.debugMesh.alwaysSelectAsActiveMesh = true;
            }
            var light = this.utilityLayer._getSharedGizmoLight();
            light.intensity = 0.7;
            this._revert(animationState);
            this.ready = true;
        }
        catch (err) {
            console.error(err);
            this._revert(animationState);
            this.dispose();
        }
    };
    SkeletonViewer.prototype._buildLocalAxes = function () {
        var _a;
        if (this._localAxes) {
            this._localAxes.dispose();
        }
        this._localAxes = null;
        var displayOptions = this.options.displayOptions || {};
        if (!displayOptions.showLocalAxes) {
            return;
        }
        var targetScene = this._utilityLayer.utilityLayerScene;
        var size = displayOptions.localAxesSize || 0.075;
        var lines = [];
        var colors = [];
        var red = new Color4(1, 0, 0, 1);
        var green = new Color4(0, 1, 0, 1);
        var blue = new Color4(0, 0, 1, 1);
        var mwk = [];
        var mik = [];
        var vertsPerBone = 6;
        for (var i in this.skeleton.bones) {
            var bone = this.skeleton.bones[i];
            if (bone._index === -1 || (!this._boneIndices.has(bone.getIndex()) && !this.options.useAllBones)) {
                continue;
            }
            var boneAbsoluteBindPoseTransform = new Matrix();
            var boneOrigin = new Vector3();
            this._getAbsoluteBindPoseToRef(bone, boneAbsoluteBindPoseTransform);
            boneAbsoluteBindPoseTransform.decompose(undefined, TmpVectors.Quaternion[0], boneOrigin);
            var m = new Matrix();
            TmpVectors.Quaternion[0].toRotationMatrix(m);
            var boneAxisX = Vector3.TransformCoordinates(new Vector3(0 + size, 0, 0), m);
            var boneAxisY = Vector3.TransformCoordinates(new Vector3(0, 0 + size, 0), m);
            var boneAxisZ = Vector3.TransformCoordinates(new Vector3(0, 0, 0 + size), m);
            var axisX = [boneOrigin, boneOrigin.add(boneAxisX)];
            var axisY = [boneOrigin, boneOrigin.add(boneAxisY)];
            var axisZ = [boneOrigin, boneOrigin.add(boneAxisZ)];
            var linePoints = [axisX, axisY, axisZ];
            var lineColors = [
                [red, red],
                [green, green],
                [blue, blue],
            ];
            lines.push.apply(lines, linePoints);
            colors.push.apply(colors, lineColors);
            for (var j = 0; j < vertsPerBone; j++) {
                mwk.push(1, 0, 0, 0);
                mik.push(bone.getIndex(), 0, 0, 0);
            }
        }
        this._localAxes = CreateLineSystem("localAxes", { lines: lines, colors: colors, updatable: true }, targetScene);
        this._localAxes.setVerticesData(VertexBuffer.MatricesWeightsKind, mwk, false);
        this._localAxes.setVerticesData(VertexBuffer.MatricesIndicesKind, mik, false);
        this._localAxes.skeleton = this.skeleton;
        this._localAxes.renderingGroupId = this.renderingGroupId + 1;
        this._localAxes.parent = this.mesh;
        this._localAxes.computeBonesUsingShaders = (_a = this.options.computeBonesUsingShaders) !== null && _a !== void 0 ? _a : true;
    };
    /** Update the viewer to sync with current skeleton state, only used for the line display. */
    SkeletonViewer.prototype._displayLinesUpdate = function () {
        if (!this._utilityLayer) {
            return;
        }
        if (this.autoUpdateBonesMatrices) {
            this.skeleton.computeAbsoluteTransforms();
        }
        if (this.skeleton.bones[0].length === undefined) {
            this._getLinesForBonesNoLength(this.skeleton.bones);
        }
        else {
            this._getLinesForBonesWithLength(this.skeleton.bones, this.mesh.getWorldMatrix());
        }
        var targetScene = this._utilityLayer.utilityLayerScene;
        if (targetScene) {
            if (!this._debugMesh) {
                this._debugMesh = CreateLineSystem("", { lines: this._debugLines, updatable: true, instance: null }, targetScene);
                this._debugMesh.renderingGroupId = this.renderingGroupId;
            }
            else {
                CreateLineSystem("", { lines: this._debugLines, updatable: true, instance: this._debugMesh }, targetScene);
            }
            this._debugMesh.position.copyFrom(this.mesh.position);
            this._debugMesh.color = this.color;
        }
    };
    /** Changes the displayMode of the skeleton viewer
     * @param mode The displayMode numerical value
     */
    SkeletonViewer.prototype.changeDisplayMode = function (mode) {
        var wasEnabled = this.isEnabled ? true : false;
        if (this.displayMode !== mode) {
            this.isEnabled = false;
            if (this._debugMesh) {
                this._debugMesh.dispose();
                this._debugMesh = null;
                this.ready = false;
            }
            this.displayMode = mode;
            this.update();
            this._bindObs();
            this.isEnabled = wasEnabled;
        }
    };
    /** Sets a display option of the skeleton viewer
     *
     * | Option           | Type    | Default | Description |
     * | ---------------- | ------- | ------- | ----------- |
     * | midStep          | float   | 0.235   | A percentage between a bone and its child that determines the widest part of a spur. Only used when `displayMode` is set to `DISPLAY_SPHERE_AND_SPURS`. |
     * | midStepFactor    | float   | 0.15    | Mid step width expressed as a factor of the length. A value of 0.5 makes the spur width half of the spur length. Only used when `displayMode` is set to `DISPLAY_SPHERE_AND_SPURS`. |
     * | sphereBaseSize   | float   | 2       | Sphere base size. Only used when `displayMode` is set to `DISPLAY_SPHERE_AND_SPURS`. |
     * | sphereScaleUnit  | float   | 0.865   | Sphere scale factor used to scale spheres in relation to the longest bone. Only used when `displayMode` is set to `DISPLAY_SPHERE_AND_SPURS`. |
     * | spurFollowsChild | boolean | false   | Whether a spur should attach its far end to the child bone. |
     * | showLocalAxes    | boolean | false   | Displays local axes on all bones. |
     * | localAxesSize    | float   | 0.075   | Determines the length of each local axis. |
     *
     * @param option String of the option name
     * @param value The numerical option value
     */
    SkeletonViewer.prototype.changeDisplayOptions = function (option, value) {
        var wasEnabled = this.isEnabled ? true : false;
        this.options.displayOptions[option] = value;
        this.isEnabled = false;
        if (this._debugMesh) {
            this._debugMesh.dispose();
            this._debugMesh = null;
            this.ready = false;
        }
        this.update();
        this._bindObs();
        this.isEnabled = wasEnabled;
    };
    /** Release associated resources */
    SkeletonViewer.prototype.dispose = function () {
        this.isEnabled = false;
        if (this._debugMesh) {
            this._debugMesh.dispose();
            this._debugMesh = null;
        }
        if (this._utilityLayer) {
            this._utilityLayer.dispose();
            this._utilityLayer = null;
        }
        this.ready = false;
    };
    /** public Display constants BABYLON.SkeletonViewer.DISPLAY_LINES */
    SkeletonViewer.DISPLAY_LINES = 0;
    /** public Display constants BABYLON.SkeletonViewer.DISPLAY_SPHERES */
    SkeletonViewer.DISPLAY_SPHERES = 1;
    /** public Display constants BABYLON.SkeletonViewer.DISPLAY_SPHERE_AND_SPURS */
    SkeletonViewer.DISPLAY_SPHERE_AND_SPURS = 2;
    return SkeletonViewer;
}());
export { SkeletonViewer };
//# sourceMappingURL=skeletonViewer.js.map