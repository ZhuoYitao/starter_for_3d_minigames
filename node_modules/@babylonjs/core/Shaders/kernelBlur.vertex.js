// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/kernelBlurVaryingDeclaration.js";
import "./ShadersInclude/kernelBlurVertex.js";
var name = "kernelBlurVertexShader";
var shader = "attribute vec2 position;\nuniform vec2 delta;\nvarying vec2 sampleCenter;\n#include<kernelBlurVaryingDeclaration>[0..varyingCount]\nconst vec2 madd=vec2(0.5,0.5);\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\nsampleCenter=(position*madd+madd);\n#include<kernelBlurVertex>[0..varyingCount]\ngl_Position=vec4(position,0.0,1.0);\n#define CUSTOM_VERTEX_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var kernelBlurVertexShader = { name: name, shader: shader };
//# sourceMappingURL=kernelBlur.vertex.js.map