// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "depthBoxBlurPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform vec2 screenSize;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\nvec4 colorDepth=vec4(0.0);\nfor (int x=-OFFSET; x<=OFFSET; x++)\nfor (int y=-OFFSET; y<=OFFSET; y++)\ncolorDepth+=texture2D(textureSampler,vUV+vec2(x,y)/screenSize);\ngl_FragColor=(colorDepth/float((OFFSET*2+1)*(OFFSET*2+1)));\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var depthBoxBlurPixelShader = { name: name, shader: shader };
//# sourceMappingURL=depthBoxBlur.fragment.js.map