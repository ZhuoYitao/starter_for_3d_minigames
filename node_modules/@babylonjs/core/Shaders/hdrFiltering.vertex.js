// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "hdrFilteringVertexShader";
var shader = "attribute vec2 position;\nvarying vec3 direction;\nuniform vec3 up;\nuniform vec3 right;\nuniform vec3 front;\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\nmat3 view=mat3(up,right,front);\ndirection=view*vec3(position,1.0);\ngl_Position=vec4(position,0.0,1.0);\n#define CUSTOM_VERTEX_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var hdrFilteringVertexShader = { name: name, shader: shader };
//# sourceMappingURL=hdrFiltering.vertex.js.map