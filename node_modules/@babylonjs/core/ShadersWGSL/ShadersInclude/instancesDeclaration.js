// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "instancesDeclaration";
var shader = "#ifdef INSTANCES\nattribute world0 : vec4<f32>;\nattribute world1 : vec4<f32>;\nattribute world2 : vec4<f32>;\nattribute world3 : vec4<f32>;\n#ifdef INSTANCESCOLOR\nattribute instanceColor : vec4<f32>;\n#endif\n#if defined(THIN_INSTANCES) && !defined(WORLD_UBO)\nuniform world : mat4x4<f32>;\n#endif\n#if defined(VELOCITY) || defined(PREPASS_VELOCITY)\nattribute previousWorld0 : vec4<f32>;\nattribute previousWorld1 : vec4<f32>;\nattribute previousWorld2 : vec4<f32>;\nattribute previousWorld3 : vec4<f32>;\n#ifdef THIN_INSTANCES\nuniform previousWorld : mat4x4<f32>;\n#endif\n#endif\n#else\n#if !defined(WORLD_UBO)\nuniform world : mat4x4<f32>;\n#endif\n#if defined(VELOCITY) || defined(PREPASS_VELOCITY)\nuniform previousWorld : mat4x4<f32>;\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var instancesDeclaration = { name: name, shader: shader };
//# sourceMappingURL=instancesDeclaration.js.map