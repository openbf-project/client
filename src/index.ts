
import { Exponent, EXPONENT_CSS_STYLES, Panel } from "@repcomm/exponent-ts";
import { PhysicsLoader } from "enable3d";
import { Renderer } from "./components/renderer";

async function main () {
  console.log("Loaded");

  EXPONENT_CSS_STYLES.mount(document.head);
  
  const STYLES = new Exponent ()
  .make("style")
  .setId("client-styles")
  .setTextContent(`
  body {
    display: flex;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
  }
  .exponent-canvas {
    min-width: 0;
    min-height: 0;
    width: 100%;
    height: 100%;
  }
  `)
  .mount(document.head);
  
  const container = new Panel()
  .setId("container")
  .mount(document.body);
  
  console.log("Creating renderer");
  const renderer = new Renderer()
  .setId("renderer")
  .mount(container);
  
  
  }
  PhysicsLoader("./lib/ammo/kripken", ()=>main());
  