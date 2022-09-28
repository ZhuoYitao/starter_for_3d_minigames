// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "clipPlaneVertex";
var shader = "#ifdef CLIPPLANE\nfClipDistance=dot(worldPos,uniforms.vClipPlane);\n#endif\n#ifdef CLIPPLANE2\nfClipDistance2=dot(worldPos,uniforms.vClipPlane2);\n#endif\n#ifdef CLIPPLANE3\nfClipDistance3=dot(worldPos,uniforms.vClipPlane3);\n#endif\n#ifdef CLIPPLANE4\nfClipDistance4=dot(worldPos,uniforms.vClipPlane4);\n#endif\n#ifdef CLIPPLANE5\nfClipDistance5=dot(worldPos,uniforms.vClipPlane5);\n#endif\n#ifdef CLIPPLANE6\nfClipDistance6=dot(worldPos,uniforms.vClipPlane6);\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var clipPlaneVertex = { name: name, shader: shader };
//# sourceMappingURL=clipPlaneVertex.js.map