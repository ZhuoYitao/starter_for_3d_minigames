// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/instancesDeclaration.js";
import "./ShadersInclude/clipPlaneVertexDeclaration.js";
import "./ShadersInclude/instancesVertex.js";
import "./ShadersInclude/clipPlaneVertex.js";
var name = "lineVertexShader";
var shader = "#include<instancesDeclaration>\n#include<clipPlaneVertexDeclaration>\nattribute vec3 position;\nattribute vec4 normal;\nuniform mat4 viewProjection;\nuniform float width;\nuniform float aspectRatio;\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\n#include<instancesVertex>\nmat4 worldViewProjection=viewProjection*finalWorld;\nvec4 viewPosition=worldViewProjection*vec4(position,1.0);\nvec4 viewPositionNext=worldViewProjection*vec4(normal.xyz,1.0);\nvec2 currentScreen=viewPosition.xy/viewPosition.w;\nvec2 nextScreen=viewPositionNext.xy/viewPositionNext.w;\ncurrentScreen.x*=aspectRatio;\nnextScreen.x*=aspectRatio;\nvec2 dir=normalize(nextScreen-currentScreen);\nvec2 normalDir=vec2(-dir.y,dir.x);\nnormalDir*=width/2.0;\nnormalDir.x/=aspectRatio;\nvec4 offset=vec4(normalDir*normal.w,0.0,0.0);\ngl_Position=viewPosition+offset;\n#if defined(CLIPPLANE) || defined(CLIPPLANE2) || defined(CLIPPLANE3) || defined(CLIPPLANE4) || defined(CLIPPLANE5) || defined(CLIPPLANE6)\nvec4 worldPos=finalWorld*vec4(position,1.0);\n#include<clipPlaneVertex>\n#endif\n#define CUSTOM_VERTEX_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var lineVertexShader = { name: name, shader: shader };
//# sourceMappingURL=line.vertex.js.map