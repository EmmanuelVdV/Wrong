// Variable initialization
const ppi = 96; // pixels per inch
// const width_mm = 210; // width in millimeters (multiple of 96ppi = 96*8*24,4/96)
// const height_mm = 297; // height in millimeters

// let w = mm2px(width_mm, ppi);
// let h = mm2px(height_mm, ppi);

let w, h; // width and height of canvas
let xCenter, yCenter; // center of the canvas

let strokeW_mm = .1 // stroke weigth in mm
let sw = mm2px(strokeW_mm, ppi);

const colWidth = 5; //10; // width of columns
const cellHeight = 200; // default height of one cell
let nCols; // number of columns

// Perlin noise initialization
const dNoise = 0.09;

let draw; // SVG canvas

let selectSingularity = false; // has the Singularity been identified ?
let isSingularity = false; // is the current Shape the Singularity ?

let click = function () {
  let svg = draw.svg();
  let blob = new Blob([svg], { type: "image/svg+xml" });

  let dl = document.createElement("a");
  dl.download = "Wrong-" + getTimeStamp() + ".svg";
  dl.href = URL.createObjectURL(blob);
  dl.dataset.downloadurl = ["image/svg+xml", dl.download, dl.href].join(':');
  dl.style.display = "none";
  document.body.appendChild(dl);

  dl.click();

  document.body.removeChild(dl);
}

init();

window.addEventListener('resize', windowResized);

function windowResized() {
  let elements = document.body.getElementsByTagName("svg");
  document.body.removeChild(elements[0]);
  selectSingularity = false;
  isSingularity = false;
  init();
}

function init() {
  noise.seed(Math.random(nCols));

  w = h = Math.min(document.body.clientWidth, document.body.clientHeight);
  xCenter = yCenter = w / 2; // center of canvas
  nCols = Math.round(w / colWidth);

  console.log(w, h, nCols);

  draw = SVG().addTo('body').size(w, h);
  // draw.rotate(45);

  let groups = [draw.group().addClass('singularity'), draw.group().addClass('other')]; // groups to handle Singularity and the rest

  for (let col = 0; col < nCols; col++) { // brwosing the columns
    let thisCell = 0;
    let reach = -cellHeight;
    while (reach < h) { // generating the "cells" within a column from top to bottom
      let thisCellHeight = cellHeight * (0.4 + Math.abs(noise.perlin2(col * dNoise, thisCell * dNoise)));

      if (!selectSingularity) { // selection of Singularity
        isSingularity = ((Math.random() > 0.45) && (col > nCols*0.3) && (reach > h*0.3)) ? true : false;
        if (isSingularity) selectSingularity = true;
      }

      for (l = 0; l < colWidth; l++) { // drawing lines inside a cell$
        if (isSingularity) {
          let line = draw.line(col * colWidth + colWidth / 2, reach, l + col * colWidth, reach + thisCellHeight);
          line.stroke({ color: '#FF0000', width: sw }).fill('none'); // draw line
          groups[0].add(line); // add to Singularity group
          console.log("found singularity");
        } else {
          let line = draw.line(l + col * colWidth, reach, col * colWidth + colWidth / 2, reach + thisCellHeight);
          line.stroke({ color: '#000000', width: sw }).fill('none'); // draw line
          groups[1].add(line); // add to other group
        }
      }

      isSingularity = false;
      thisCell++;
      reach += thisCellHeight;

      // console.log(col, reach);
    }

  }

  //let rect = draw.rect(w, h).stroke({ color: '#FFFFFF' }).back();
  draw.on('click', click);
}

