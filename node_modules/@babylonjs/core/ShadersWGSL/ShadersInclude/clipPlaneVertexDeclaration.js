// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "clipPlaneVertexDeclaration";
var shader = "#ifdef CLIPPLANE\nuniform vClipPlane: vec4<f32>;\nvarying fClipDistance: f32;\n#endif\n#ifdef CLIPPLANE2\nuniform vClipPlane2: vec4<f32>;\nvarying fClipDistance2: f32;\n#endif\n#ifdef CLIPPLANE3\nuniform vClipPlane3: vec4<f32>;\nvarying fClipDistance3: f32;\n#endif\n#ifdef CLIPPLANE4\nuniform vClipPlane4: vec4<f32>;\nvarying fClipDistance4: f32;\n#endif\n#ifdef CLIPPLANE5\nuniform vClipPlane5: vec4<f32>;\nvarying fClipDistance5: f32;\n#endif\n#ifdef CLIPPLANE6\nuniform vClipPlane6: vec4<f32>;\nvarying fClipDistance6: f32;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var clipPlaneVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=clipPlaneVertexDeclaration.js.map