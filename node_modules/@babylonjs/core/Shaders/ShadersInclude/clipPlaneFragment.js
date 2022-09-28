// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "clipPlaneFragment";
var shader = "#if defined(CLIPPLANE) || defined(CLIPPLANE2) || defined(CLIPPLANE3) || defined(CLIPPLANE4) || defined(CLIPPLANE5) || defined(CLIPPLANE6)\nif (false) {}\n#endif\n#ifdef CLIPPLANE\nelse if (fClipDistance>0.0)\n{\ndiscard;\n}\n#endif\n#ifdef CLIPPLANE2\nelse if (fClipDistance2>0.0)\n{\ndiscard;\n}\n#endif\n#ifdef CLIPPLANE3\nelse if (fClipDistance3>0.0)\n{\ndiscard;\n}\n#endif\n#ifdef CLIPPLANE4\nelse if (fClipDistance4>0.0)\n{\ndiscard;\n}\n#endif\n#ifdef CLIPPLANE5\nelse if (fClipDistance5>0.0)\n{\ndiscard;\n}\n#endif\n#ifdef CLIPPLANE6\nelse if (fClipDistance6>0.0)\n{\ndiscard;\n}\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var clipPlaneFragment = { name: name, shader: shader };
//# sourceMappingURL=clipPlaneFragment.js.map