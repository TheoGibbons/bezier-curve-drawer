const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let points = []; // Stores all draggable points
let curves = []; // Stores all drawn curves
let currentPoints = []; // Points for the current curve being drawn

// Adjust canvas size to fit the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Event listener for canvas clicks
canvas.addEventListener('click', onCanvasClick);

function onCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  addPoint(x, y);

  if (currentPoints.length === 4) {
    // We have enough points to draw a Bezier curve
    curves.push([...currentPoints]);
    currentPoints = [currentPoints[3]]; // Start next curve from the last end point
    drawAll();
  }
}

function addPoint(x, y) {
  const point = createDraggablePoint(x, y);
  points.push(point);
  currentPoints.push(point);
}

function createDraggablePoint(x, y) {
  const pointElem = document.createElement('div');
  pointElem.className = 'point';
  document.body.appendChild(pointElem);

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.innerText = `(${x.toFixed(0)}, ${y.toFixed(0)})`;
  document.body.appendChild(tooltip);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  pointElem.style.left = x + 'px';
  pointElem.style.top = y + 'px';
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';

  pointElem.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - x;
    offsetY = e.clientY - y;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      x = e.clientX - offsetX;
      y = e.clientY - offsetY;
      pointElem.style.left = x + 'px';
      pointElem.style.top = y + 'px';
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
      tooltip.innerText = `(${x.toFixed(0)}, ${y.toFixed(0)})`;
      drawAll();
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  return { getX: () => x, getY: () => y };
}

function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw existing curves
  curves.forEach((curvePoints) => {
    drawCurve(curvePoints);
  });

  // Draw the current curve in progress
  if (currentPoints.length >= 2) {
    drawCurve(currentPoints);
  }
}

function drawCurve(pointsArray) {
  if (pointsArray.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(pointsArray[0].getX(), pointsArray[0].getY());

  if (pointsArray.length === 2) {
    ctx.lineTo(pointsArray[1].getX(), pointsArray[1].getY());
  } else if (pointsArray.length === 3) {
    ctx.quadraticCurveTo(
      pointsArray[1].getX(), pointsArray[1].getY(),
      pointsArray[2].getX(), pointsArray[2].getY()
    );
  } else if (pointsArray.length === 4) {
    ctx.bezierCurveTo(
      pointsArray[1].getX(), pointsArray[1].getY(),
      pointsArray[2].getX(), pointsArray[2].getY(),
      pointsArray[3].getX(), pointsArray[3].getY()
    );
  }

  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Optionally, draw control lines
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pointsArray[0].getX(), pointsArray[0].getY());
  for (let i = 1; i < pointsArray.length; i++) {
    ctx.lineTo(pointsArray[i].getX(), pointsArray[i].getY());
  }
  ctx.stroke();
}