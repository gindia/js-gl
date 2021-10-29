/*
  * A Simple WebGL Demo in JavaScript.
  *
  * (C) 2021 Omar M.Gindia, All rightes reserved.
  */

function main() {
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl");

  if (gl === null) {
    alert("Unable to init WebGL.");
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
