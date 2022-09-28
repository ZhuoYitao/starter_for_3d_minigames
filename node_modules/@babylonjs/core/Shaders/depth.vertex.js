// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/bonesDeclaration.js";
import "./ShadersInclude/bakedVertexAnimationDeclaration.js";
import "./ShadersInclude/morphTargetsVertexGlobalDeclaration.js";
import "./ShadersInclude/morphTargetsVertexDeclaration.js";
import "./ShadersInclude/instancesDeclaration.js";
import "./ShadersInclude/morphTargetsVertexGlobal.js";
import "./ShadersInclude/morphTargetsVertex.js";
import "./ShadersInclude/instancesVertex.js";
import "./ShadersInclude/bonesVertex.js";
import "./ShadersInclude/bakedVertexAnimation.js";
var name = "depthVertexShader";
var shader = "attribute vec3 position;\n#include<bonesDeclaration>\n#include<bakedVertexAnimationDeclaration>\n#include<morphTargetsVertexGlobalDeclaration>\n#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]\n#include<instancesDeclaration>\nuniform mat4 viewProjection;\nuniform vec2 depthValues;\n#if defined(ALPHATEST) || defined(NEED_UV)\nvarying vec2 vUV;\nuniform mat4 diffuseMatrix;\n#ifdef UV1\nattribute vec2 uv;\n#endif\n#ifdef UV2\nattribute vec2 uv2;\n#endif\n#endif\nvarying float vDepthMetric;\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void)\n{\nvec3 positionUpdated=position;\n#ifdef UV1\nvec2 uvUpdated=uv;\n#endif\n#include<morphTargetsVertexGlobal>\n#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]\n#include<instancesVertex>\n#include<bonesVertex>\n#include<bakedVertexAnimation>\ngl_Position=viewProjection*finalWorld*vec4(positionUpdated,1.0);\n#ifdef USE_REVERSE_DEPTHBUFFER\nvDepthMetric=((-gl_Position.z+depthValues.x)/(depthValues.y));\n#else\nvDepthMetric=((gl_Position.z+depthValues.x)/(depthValues.y));\n#endif\n#if defined(ALPHATEST) || defined(BASIC_RENDER)\n#ifdef UV1\nvUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));\n#endif\n#ifdef UV2\nvUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));\n#endif\n#endif\n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var depthVertexShader = { name: name, shader: shader };
//# sourceMappingURL=depth.vertex.js.map