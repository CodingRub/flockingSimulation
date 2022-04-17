import { Boid } from './Boid.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 700;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const boidRange = document.getElementById("nbrBoid");
const cohRange = document.getElementById("cohRange");
const aliRange = document.getElementById("aliRange");
const sepRange = document.getElementById("sepRange");
const speedRange = document.getElementById("speedRange");
const forceRange = document.getElementById("forceRange");
const percepRange = document.getElementById("percepRange");
const predateCheck = document.getElementById("predateCheck");
const seekCheck = document.getElementById("seekCheck");

let nbrBoid = boidRange.value;
let coh = cohRange.value;
let ali = aliRange.value;
let rac = sepRange.value;
let speed = speedRange.value;
let force = forceRange.value;
let percep = percepRange.value;
let predate = predateCheck.checked;
let seek = seekCheck.checked;

const labelBoid = document.getElementById("labelBoid");
labelBoid.innerText = nbrBoid;
const labelCoh = document.getElementById("labelCoh");
labelCoh.innerText = coh;
const labelAli = document.getElementById("labelAli");
labelAli.innerText = ali;
const labelRac = document.getElementById("labelRac");
labelRac.innerText = rac;
const labelSpeed = document.getElementById("labelSpeed");
labelSpeed.innerText = speed;
const labelForce = document.getElementById("labelForce");
labelForce.innerText = force;
const labelPercep = document.getElementById("labelPercep");
labelPercep.innerText = percep;

let lstBoid = [];

cohRange.addEventListener('change', function() {
    labelCoh.innerText = cohRange.value;
    coh = cohRange.value 
})

aliRange.addEventListener('change', function() {
    labelAli.innerText = aliRange.value;
    ali = aliRange.value;
})

sepRange.addEventListener('change', function() {
    labelRac.innerText = sepRange.value;
    rac = sepRange.value;
})

speedRange.addEventListener('change', function() {
    labelSpeed.innerText = speedRange.value;
    speed = speedRange.value;
})

forceRange.addEventListener('change', function() {
    labelForce.innerText = forceRange.value;
    force = forceRange.value;
})

percepRange.addEventListener('change', function() {
    labelPercep.innerText = percepRange.value;
    percep = percepRange.value;
})

predateCheck.addEventListener('change', function() {
    predate = predateCheck.checked;
})

seekCheck.addEventListener('change', function() {
    seek = seekCheck.checked;
})



function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function setup(nbrBoid) {
    for (let i = 0; i < nbrBoid; i++) {    
        let x_part = getRndInteger(canvas.width, 0);
        let y_part = getRndInteger(0, canvas.height);
        lstBoid.push(new Boid(x_part, y_part));
    }
}

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pour tous
    for (let boid of lstBoid) {
/*         boid.showLine(lstBoid, "green")
        boid.showDirection(); */
        boid.flocking(lstBoid, rac, ali, coh, predate, seek)
        boid.bounceOffWalls();
        boid.update();
        boid.updateSpeed(speed);
        boid.updateForce(force);
        boid.updatePerception(percep);
        boid.show();  
    }

    // Montre le nombre de boids et les coordonnées du boid principal
    ctx.textAlign = "right";
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.fillText(lstBoid.length, 60, 30, 100);
}


function reset(nbrBoid) {
    lstBoid.splice(0, lstBoid.length);
    setup(nbrBoid);
    draw();
}


boidRange.addEventListener('change', function() {
    labelBoid.innerText = boidRange.value;
    nbrBoid = boidRange.value;
    reset(nbrBoid);
})

