// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "clipPlaneFragmentDeclaration";
var shader = "#ifdef CLIPPLANE\nvarying fClipDistance: f32;\n#endif\n#ifdef CLIPPLANE2\nvarying fClipDistance2: f32;\n#endif\n#ifdef CLIPPLANE3\nvarying fClipDistance3: f32;\n#endif\n#ifdef CLIPPLANE4\nvarying fClipDistance4: f32;\n#endif\n#ifdef CLIPPLANE5\nvarying fClipDistance5: f32;\n#endif\n#ifdef CLIPPLANE6\nvarying fClipDistance6: f32;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var clipPlaneFragmentDeclaration = { name: name, shader: shader };
//# sourceMappingURL=clipPlaneFragmentDeclaration.js.map