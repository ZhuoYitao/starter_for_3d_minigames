// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/boundingBoxRendererVertexDeclaration.js";
import "./ShadersInclude/boundingBoxRendererUboDeclaration.js";
var name = "boundingBoxRendererVertexShader";
var shader = "attribute vec3 position;\n#include<__decl__boundingBoxRendererVertex>\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\nvec4 worldPos=world*vec4(position,1.0);\n#ifdef MULTIVIEW\nif (gl_ViewID_OVR==0u) {\ngl_Position=viewProjection*worldPos;\n} else {\ngl_Position=viewProjectionR*worldPos;\n}\n#else\ngl_Position=viewProjection*worldPos;\n#endif\n#define CUSTOM_VERTEX_MAIN_END\n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var boundingBoxRendererVertexShader = { name: name, shader: shader };
//# sourceMappingURL=boundingBoxRenderer.vertex.js.map