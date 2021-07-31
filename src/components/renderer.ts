
import { Panel } from "@repcomm/exponent-ts";
import { Canvas } from "./canvas";
import { THREE } from "enable3d";
import { AmmoPhysics } from "@enable3d/ammo-physics";

// import { LookCamera } from "../utils/lookcamera";
import { LookCamera } from "@repcomm/three.lookcamera";
import { GameInput } from "@repcomm/gameinput-ts";

/**Holds info on a scene, its physics, and the camera rendering it
 * stfu, i know there can be multiple cameras.
*/
export interface MetaScene {
  scene?: THREE.Scene;
  physics?: AmmoPhysics;
  camera?: THREE.PerspectiveCamera;
}

export class Renderer extends Panel {
  private canvas: Canvas;

  private threeRenderer: THREE.WebGLRenderer;

  private defaultMetaScene: MetaScene;
  private currentMetaScene: MetaScene;

  constructor () {
    super();

    this.canvas = new Canvas()
    .mount(this);

    // this.canvasCtx = this.canvas.element.getContext("webgl");

    this.threeRenderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: false,
      canvas: this.canvas.element,
      depth: true
    });

    this.threeRenderer.setPixelRatio(1)

    window.addEventListener("resize", ()=>{
      this.notifyScreenResized();
    });

    //create default scene things (in an anonymous function to avoid polluting scope with junk variables)
    let lookcam: LookCamera;
    (()=>{
      this.defaultMetaScene = {};

      let scene = new THREE.Scene();
      // scene.background = new THREE.Color(0xff0000);

      scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
      scene.add(new THREE.AmbientLight(0x666666));
      
      const light = new THREE.DirectionalLight(0xdfebff, 1);
      light.position.set(50, 200, 100);
      light.position.multiplyScalar(1.3);

      this.defaultMetaScene.scene = scene;

      let physics = new AmmoPhysics(scene);
      // physics.debug.enable();

      this.defaultMetaScene.physics = physics;

      //objects stuff
      physics.add.sphere({
        mass: 2,
        x: 0, y: 0, z: 0,
        radius: 3,
        collisionFlags: 1
      }, {
        standard: { color: "yellow" }
      });

      // gltf

      // physics.add.existing(gltf, {
      //   shape: "hacd"
      // })

      physics.add.box(
        { x: 0, y: 10, z: 0, width: 1, height: 1, depth: 1, mass: 2, collisionFlags: 0 },
        { lambert: { color: 'red', transparent: true, opacity: 0.5 } }
      )
      physics.add.box(
        { x: 0, y: 10, z: 0, width: 1, height: 1, depth: 1, mass: 2, collisionFlags: 0 },
        { lambert: { color: 'blue', transparent: true, opacity: 0.5 } }
      )

      lookcam = new LookCamera({});
      
      scene.add(lookcam as any);
      lookcam.position.set(0, 0, 8);
      
      this.defaultMetaScene.camera = lookcam.getCamera() as any;
    })();
    
    //set the current scene
    this.currentMetaScene = this.defaultMetaScene;
    
    
    let input = GameInput.get();

    //keep looking until this is false
    let doRender = true;

    //frame animation iteration
    const renderIteration: FrameRequestCallback = (delta) => {
      // console.log("render");
      if (!this.currentMetaScene) return;
      
      if (!input.raw.pointerIsLocked()) {
        if (input.raw.getPointerButton(0)) {
          input.raw.pointerTryLock(this.canvas.element);
        }
        lookcam.setLookEnabled(false);
      } else {
        lookcam.setLookEnabled(true);
      }

      let mx = input.builtinMovementConsumer.getDeltaX();
      let my = input.builtinMovementConsumer.getDeltaY();
      // console.log(mx, my);
      lookcam.addRotationInput(
        mx,
        my
      );

      this.currentMetaScene.physics.update( delta / 1000 );

      this.currentMetaScene.physics.updateDebugger();
      
      this.threeRenderer.render( this.currentMetaScene.scene, this.currentMetaScene.camera );

      if (doRender) window.requestAnimationFrame(renderIteration);
    };
    window.requestAnimationFrame(renderIteration);

    setTimeout(()=>{
      this.notifyScreenResized();
    }, 1000);

  }
  notifyScreenResized () {
    let r = this.rect;

    this.threeRenderer.setSize(r.width, r.height, false);

    this.currentMetaScene.camera.aspect = r.width / r.height;
    this.currentMetaScene.camera.updateProjectionMatrix();
  }
}
