// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/bonesDeclaration.js";
import "./ShadersInclude/bakedVertexAnimationDeclaration.js";
import "./ShadersInclude/morphTargetsVertexGlobalDeclaration.js";
import "./ShadersInclude/morphTargetsVertexDeclaration.js";
import "./ShadersInclude/helperFunctions.js";
import "./ShadersInclude/shadowMapVertexDeclaration.js";
import "./ShadersInclude/shadowMapUboDeclaration.js";
import "./ShadersInclude/shadowMapVertexExtraDeclaration.js";
import "./ShadersInclude/clipPlaneVertexDeclaration.js";
import "./ShadersInclude/morphTargetsVertexGlobal.js";
import "./ShadersInclude/morphTargetsVertex.js";
import "./ShadersInclude/instancesVertex.js";
import "./ShadersInclude/bonesVertex.js";
import "./ShadersInclude/bakedVertexAnimation.js";
import "./ShadersInclude/shadowMapVertexNormalBias.js";
import "./ShadersInclude/shadowMapVertexMetric.js";
import "./ShadersInclude/clipPlaneVertex.js";
var name = "shadowMapVertexShader";
var shader = "attribute vec3 position;\n#ifdef NORMAL\nattribute vec3 normal;\n#endif\n#include<bonesDeclaration>\n#include<bakedVertexAnimationDeclaration>\n#include<morphTargetsVertexGlobalDeclaration>\n#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]\n#ifdef INSTANCES\nattribute vec4 world0;\nattribute vec4 world1;\nattribute vec4 world2;\nattribute vec4 world3;\n#endif\n#include<helperFunctions>\n#include<__decl__shadowMapVertex>\n#ifdef ALPHATEST\nvarying vec2 vUV;\nuniform mat4 diffuseMatrix;\n#ifdef UV1\nattribute vec2 uv;\n#endif\n#ifdef UV2\nattribute vec2 uv2;\n#endif\n#endif\n#include<shadowMapVertexExtraDeclaration>\n#include<clipPlaneVertexDeclaration>\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void)\n{\nvec3 positionUpdated=position;\n#ifdef UV1\nvec2 uvUpdated=uv;\n#endif\n#ifdef NORMAL\nvec3 normalUpdated=normal;\n#endif\n#include<morphTargetsVertexGlobal>\n#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]\n#include<instancesVertex>\n#include<bonesVertex>\n#include<bakedVertexAnimation>\nvec4 worldPos=finalWorld*vec4(positionUpdated,1.0);\n#ifdef NORMAL\nmat3 normWorldSM=mat3(finalWorld);\n#if defined(INSTANCES) && defined(THIN_INSTANCES)\nvec3 vNormalW=normalUpdated/vec3(dot(normWorldSM[0],normWorldSM[0]),dot(normWorldSM[1],normWorldSM[1]),dot(normWorldSM[2],normWorldSM[2]));\nvNormalW=normalize(normWorldSM*vNormalW);\n#else\n#ifdef NONUNIFORMSCALING\nnormWorldSM=transposeMat3(inverseMat3(normWorldSM));\n#endif\nvec3 vNormalW=normalize(normWorldSM*normalUpdated);\n#endif\n#endif\n#include<shadowMapVertexNormalBias>\ngl_Position=viewProjection*worldPos;\n#include<shadowMapVertexMetric>\n#ifdef ALPHATEST\n#ifdef UV1\nvUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));\n#endif\n#ifdef UV2\nvUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));\n#endif\n#endif\n#include<clipPlaneVertex>\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var shadowMapVertexShader = { name: name, shader: shader };
//# sourceMappingURL=shadowMap.vertex.js.map