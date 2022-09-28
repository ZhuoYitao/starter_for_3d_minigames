// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "sceneUboDeclaration";
var shader = "struct Scene {\nviewProjection : mat4x4<f32>,\n#ifdef MULTIVIEW\nviewProjectionR : mat4x4<f32>,\n#endif \nview : mat4x4<f32>,\nprojection : mat4x4<f32>,\nvEyePosition : vec4<f32>,\n};\nvar<uniform> scene : Scene;\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var sceneUboDeclaration = { name: name, shader: shader };
//# sourceMappingURL=sceneUboDeclaration.js.map