// debounce by David Walsh
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// constants
const BG_COLOR = '#000000';
const BALL_BG_COLOR = 'red';
const TEXT_PATH = 'assets/hej-outline.png';
const TEXT_WIDTH = 40;
const TEXT_HEIGHT = 24;
const GRID_GAP = 20;

// lets
let engine;
let renderer;
let bigBall;
let floor;
let ceiling;
let leftWall;
let rightWall;
let initialShapes;
let mouseControl;
let gravity = -1;
let height = window.innerHeight;
let width = window.innerWidth;

// fetching data
const canvas = document.querySelector('.js-canvas');

const dpi = window.devicePixelRatio;

const {Bodies, Composites, Engine, Events, MouseConstraint, Render, World} = Matter;


// config options
const options = {
  height,
  width,
  pixelRatio: dpi,
  background: BG_COLOR,
  wireframes: false
};


const bigBallOptions = {
  isStatic: true,
  render: {
    fillStyle: BALL_BG_COLOR
  }
};

const edgeOptions = {
  isStatic: true,
  render: {
    visible: false
  }
};

const textOptions = {
  render: {
    sprite: {
      texture: TEXT_PATH,
      xScale: 0.5,
      yScale: 0.5
    }
  }
};

const mouseControlOptions = {
  element: canvas,
  constraint: {
    render: {
      visible: false
    }
  }
};

const columnNumber = Math.ceil(width / (TEXT_WIDTH + GRID_GAP));

// functions
const createTextShape = (x, y) => Bodies.rectangle(x, y, TEXT_WIDTH, TEXT_HEIGHT, textOptions);

const handleClick = ({pageX, pageY}) => {
  const shape = createTextShape(pageX, pageY);
  World.add(engine.world, shape);
};

const handleKeypress = ({keyCode}) => {
  if (keyCode === 71) {
    engine.world.gravity.y = gravity;
    gravity = -gravity;
  }
};

const handleDeviceOrientation = ({ beta, gamma }) => {
  engine.world.gravity.y = beta / 30;
  engine.world.gravity.x = gamma / 30;
};

// matter.js init
const initMatter = () => {
  engine = Engine.create();
  renderer = Render.create({
    engine,
    options,
    element: canvas,
  });

  Engine.run(engine);
  Render.run(renderer);
};

// bodies and shapes init
const initBodiesAndShapes = () => {
  bigBall = Bodies.circle(width / 2, height / 2, 100, bigBallOptions);
  floor = Bodies.rectangle(width / 2, height + 50, width + 100, 100, edgeOptions);
  ceiling = Bodies.rectangle(width / 2, -50, width + 100, 100, edgeOptions);
  leftWall = Bodies.rectangle(-50, height / 2, 100, height + 100, edgeOptions);
  rightWall = Bodies.rectangle(width + 50, height / 2, 100, height + 100, edgeOptions);

  initialShapes = Composites.stack(0, 0, columnNumber, 10, GRID_GAP, GRID_GAP, (x, y) => createTextShape(x, y));
};

// mouse controls
const initMouseControls = () => {
  mouseControl = MouseConstraint.create(engine, mouseControlOptions);
};

// wold init
const initWorld = () => {
  World.add(engine.world, [bigBall, floor, ceiling, leftWall, rightWall, mouseControl, initialShapes]);
};

// event handling
const initEventHandlers = () => {
  document.addEventListener('mousedown', handleClick);
  document.addEventListener('keyup', handleKeypress);
};

// custom listeners
const initListeners = () => {
  window.addEventListener('deviceorientation', handleDeviceOrientation);
};

const handleResize = debounce(() => {
  console.log('resize');
  width = window.innerWidth;
  height = window.innerHeight;

  renderer.canvas.remove();
  renderer.canvas = null;
  renderer.context = null;
  renderer.textures = {};

  Render.stop(renderer);
  World.clear(engine.world);
  Engine.clear(engine);

  document.removeEventListener('mousedown', handleClick);
  document.removeEventListener('keyup', handleKeypress);
  window.removeEventListener('deviceorientation', handleDeviceOrientation);

  initMatter();
  initBodiesAndShapes();
  initMouseControls();
  initWorld();
  initEventHandlers();
  initListeners();
}, 200);

initMatter();
initBodiesAndShapes();
initMouseControls();
initWorld();
initEventHandlers();
initListeners();

window.addEventListener("resize", handleResize);
