import * as BABYLON from "../libs/babylon.js";

export default class DemoBabylon {
  run() {
    // 初始化引擎
    const engine = new BABYLON.Engine(canvas, true,{ preserveDrawingBuffer: true }, true);
    // 初始化场景
    const scene = new BABYLON.Scene(engine); 

    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  7 * Math.PI / 16, 5, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    var light1 = new BABYLON.HemisphericLight("hemiLight1", new BABYLON.Vector3(-1, 10, -5), scene);
    var light2 = new BABYLON.HemisphericLight("hemiLight2", new BABYLON.Vector3(-10, -10, -5), scene);

    var canMaterial = new BABYLON.StandardMaterial("material", scene);
    canMaterial.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/Q6i4ZiX.jpg", scene)

    var faceUV = [];
    faceUV[0] =	new BABYLON.Vector4(0, 0, 0, 0);
    faceUV[1] =	new BABYLON.Vector4(1, 0, 0.32, 1);
    faceUV[2] = new BABYLON.Vector4(0, 0, 0.25, 1);

    var faceColors = [ ];
    faceColors[0] = new BABYLON.Color4(0.5, 0.5, 0.5, 1)

    var can = BABYLON.MeshBuilder.CreateCylinder("can", {height:1.16, faceUV: faceUV, faceColors: faceColors}, scene);
    can.material = canMaterial;
    // 循环渲染
    engine.runRenderLoop(function () {
      scene.render();
    });
  }
}