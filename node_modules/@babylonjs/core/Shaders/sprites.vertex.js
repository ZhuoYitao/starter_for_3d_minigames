// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/fogVertexDeclaration.js";
var name = "spritesVertexShader";
var shader = "attribute vec4 position;\nattribute vec2 options;\nattribute vec2 offsets;\nattribute vec2 inverts;\nattribute vec4 cellInfo;\nattribute vec4 color;\nuniform mat4 view;\nuniform mat4 projection;\nvarying vec2 vUV;\nvarying vec4 vColor;\n#include<fogVertexDeclaration>\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\nvec3 viewPos=(view*vec4(position.xyz,1.0)).xyz; \nvec2 cornerPos;\nfloat angle=position.w;\nvec2 size=vec2(options.x,options.y);\nvec2 offset=offsets.xy;\ncornerPos=vec2(offset.x-0.5,offset.y -0.5)*size;\nvec3 rotatedCorner;\nrotatedCorner.x=cornerPos.x*cos(angle)-cornerPos.y*sin(angle);\nrotatedCorner.y=cornerPos.x*sin(angle)+cornerPos.y*cos(angle);\nrotatedCorner.z=0.;\nviewPos+=rotatedCorner;\ngl_Position=projection*vec4(viewPos,1.0); \nvColor=color;\nvec2 uvOffset=vec2(abs(offset.x-inverts.x),abs(1.0-offset.y-inverts.y));\nvec2 uvPlace=cellInfo.xy;\nvec2 uvSize=cellInfo.zw;\nvUV.x=uvPlace.x+uvSize.x*uvOffset.x;\nvUV.y=uvPlace.y+uvSize.y*uvOffset.y;\n#ifdef FOG\nvFogDistance=viewPos;\n#endif\n#define CUSTOM_VERTEX_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var spritesVertexShader = { name: name, shader: shader };
//# sourceMappingURL=sprites.vertex.js.map