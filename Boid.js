import { Vector } from './Vector.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


function getRndInteger(min, max) {
    return Math.random() * (max - min) + min;
}

let cursor;


addEventListener('mousemove', tellPos, true);

function tellPos(p) {
    var rect = canvas.getBoundingClientRect();
    cursor = new Vector(p.clientX - rect.left, p.clientY - rect.top)
}


export class Boid {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(getRndInteger(-1, 1), getRndInteger(-1, 1));
        this.acceleration = new Vector(0, 0);
        this.maxForce = 0.2;
        this.maxSpeed = 1;
        this.radius = 5;
        this.color = "white";
        this.perception = 50;
    }

    updateSpeed(value) {
        this.maxSpeed = value;
    }

    updateForce(value) {
        this.maxForce = value;
    }

    updatePerception(value) {
        this.perception = value;
    }

    dist(other) {
        return Math.sqrt(Math.pow(this.pos.x - other.pos.x, 2) + Math.pow(this.pos.y - other.pos.y, 2));
    }

    intersect(other) {
        let d = this.dist(other);
        return d <= this.radius + other.radius;
    }

    bounceOffWalls(){
        if (this.pos.x > canvas.width) {
            this.pos.x = 0;
        } else if (this.pos.x < 0) {
            this.pos.x = canvas.width;
        }
        if (this.pos.y > canvas.height) {
            this.pos.y = 0;
        } else if (this.pos.y < 0) {
            this.pos.y = canvas.height;
        }
    }

    seek(target) {
        let desired;
        let steer = new Vector(0, 0)
        desired = target.subtract(this.pos);
        desired = desired.normalize().multiply(this.maxSpeed)
        steer = desired.subtract(this.vel);
        return steer;
    }

    predate(target) {
        // steering force = desired velocity - current velocity
        let desired;
        let perception = this.perception;
        let total = 0;
        let steer = new Vector(0, 0)
        // Si le boid est dans le périmètre et que le boid n'est pas lui même
        let d = Math.sqrt(Math.pow(target.x - this.pos.x, 2) + Math.pow(target.y - this.pos.y, 2))
        if (d <= perception) {
            let closeness = perception - d;
            desired = this.pos.subtract(target).multiply(closeness);
            total++;
        }
        if (total > 0) {
            // Ici, on veut que la vélocité est la longueur du vecteur soit égal à la vitesse que l'on veut
            // Normaliser équivaut à mettre la magnitude à 1, ainsi on a plus qu'à la multiplier par la vitesse
            desired = desired.normalize().multiply(this.maxSpeed)
            // On calcule la steering force: (steering force = desired velocity - current velocity)
            steer = desired.subtract(this.vel)
        }
        return steer;
    }

    alignment(boids) {
        // steering force = desired velocity - current velocity
        let perception = this.perception;
        let total = 0;
        let force = new Vector(0, 0)
        for (let other of boids) {
            // Si le boid est dans le périmètre et que le boid n'est pas lui même
            if (other != this && this.dist(other) <= perception) {
                // On fait la somme de tout les vecteurs vélocité des boids présents
                force = force.add(other.vel)
                total++;
            }
        }
        if (total > 0) {
            // Pour faire le vecteur moyen, on divise la somme par le nombre de boid dans le périmètre
            force = force.divide(total);
            
            // Ici, on veut que la vélocité est la longueur du vecteur soit égal à la vitesse que l'on veut
            // Normaliser équivaut à mettre la magnitude à 1, ainsi on a plus qu'à la multiplier par la vitesse
            force = force.normalize().multiply(this.maxSpeed)
            // On calcule la steering force: (steering force = desired velocity - current velocity)
            force = force.subtract(this.vel);
        }
        return force;
    }

    cohesion(boids) {
        let perception = this.perception;
        let total = 0;
        let force = new Vector(0, 0)
        for (let other of boids) {
            // Si le boid est dans le périmètre et que le boid n'est pas lui même
            if (other != this && this.dist(other) <= perception) {
                // On fait la somme de toute les positions des boids présents
                force = force.add(other.pos)
                total++;
            }
        }
        if (total > 0) {
            // Pour faire le vecteur moyen, on divise la somme par le nombre de boid dans le périmètre
            force = force.divide(total);

            // On calcule le vecteur de ce boid au point de rassemblement
            force = force.subtract(this.pos);

            // Ici, on veut que la vélocité est la longueur du vecteur soit égal à la vitesse que l'on veut
            // Normaliser équivaut à mettre la magnitude à 1, ainsi on a plus qu'à la multiplier par la vitesse
            force = force.normalize().multiply(this.maxSpeed)
            // On calcule la steering force: (steering force = desired velocity - current velocity)
            force = force.subtract(this.vel);
        }
        return force;
    }

    separation(boids) {
        // steering force = desired velocity - current velocity
        let perception = this.perception;
        let total = 0;
        let force = new Vector(0, 0)
        for (let other of boids) {
            // Si le boid est dans le périmètre et que le boid n'est pas lui même
            if (other != this && this.dist(other) <= perception) {
                // On calcule le vecteur inverse pour qu'il s'écarte d'un boid passant
                force = force.add(this.pos.subtract(other.pos))
                // On divise le vecteur force par la distance par rapport aux autres
                force = force.divide(this.dist(other))
                total++
            }
        }
        if (total > 0) {
            // Ici, on veut que la vélocité est la longueur du vecteur soit égal à la vitesse que l'on veut
            // Normaliser équivaut à mettre la magnitude à 1, ainsi on a plus qu'à la multiplier par la vitesse
            force = force.normalize().multiply(this.maxSpeed)
            // On calcule la steering force: (steering force = desired velocity - current velocity)
            force = force.subtract(this.vel)
        }
        return force;
    }

    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acceleration = this.acceleration.add(force);
    }

    flocking(boids, sepValue, alignValue, cohValue, predateValue, seekValue) {
        // Les 5 forces
        let align = this.alignment(boids);
        let separation = this.separation(boids);
        let cohesion = this.cohesion(boids);
        let predate = this.predate(cursor)
        let seek = this.seek(cursor)
        
        if (predateValue) {
            predate = predate.multiply(5);
        } else {
            predate = predate.multiply(0);
        }

        if (seekValue) {
            seek = seek.multiply(2);
        } else {
            seek = seek.multiply(0);
        }

        // Appliquer un poids aux forces
        separation =separation.multiply(sepValue/10);
        align = align.multiply(alignValue/10);
        cohesion = cohesion.multiply(cohValue/10);


        // Je fais la somme des forces
        this.acceleration = this.acceleration.add(cohesion).add(separation).add(align).add(predate).add(seek); 
        // Je limite sa force
        if (this.acceleration.magnitude > this.maxForce) {
            this.acceleration = this.acceleration.normalize().multiply(this.maxForce);
        }
    }
    
    showPerimeter() {
        ctx.beginPath();
        ctx.fillStyle = "grey";
        ctx.arc(this.pos.x, this.pos.y, this.perception, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    showDirection() {
        let length = 100;
        ctx.beginPath();
        ctx.lineWidth = 0.5;
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.vel.x * length +this.pos.x , this.vel.y * length + this.pos.y);
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }

    showLine(boids, color) {
        for (let other of boids) {
            if (this.dist(other) <= this.perception) {
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(this.pos.x, this.pos.y);
                ctx.lineTo(other.pos.x, other.pos.y);
                ctx.strokeStyle = color;
                ctx.stroke();
            }
        }
    }

    show() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    update() {
        this.vel = this.vel.add(this.acceleration);
        this.pos = this.pos.add(this.vel);
        this.acceleration = this.acceleration.multiply(0);

    }
}