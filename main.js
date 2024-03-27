let blobs = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 3; i++) {
        blobs.push(new Blob(random(width), random(height), random(30, 70)));
    }

    window.addEventListener('deviceorientation', handleOrientation);
}


function handleOrientation(event) {
    let gamma = event.gamma;
    let beta = event.beta;
    console.log(`Gamma: ${gamma}, Beta: ${beta}`);

    let scale = Math.min(window.innerWidth, window.innerHeight) / 30;

    for (let blob of blobs) {
        blob.velocity.x = gamma / scale;
        blob.velocity.y = beta / scale;
    }
}



function draw() {
    background(0);
    for (let i = 0; i < blobs.length; i++) {
        blobs[i].move();
        blobs[i].display();
        blobs[i].checkEdges();
        // Check for collisions
        for (let j = i + 1; j < blobs.length; j++) {
            if (blobs[i].isColliding(blobs[j])) {
                blobs[i].mergeWith(blobs[j]);
            }
        }
    }
}

class Blob {
    constructor(x, y, size) {
        this.position = createVector(x, y);
        this.velocity = createVector(random(-1, 1), random(-1, 1)).mult(0.5);
        this.size = size;
        this.color = [random(255), random(255), random(255), 200];
        this.merged = false;
        this.mergeStep = 0.05;
    }

    move() {
        if (!this.merged) {
        this.position.add(this.velocity);
        } else {
        // Merged blobs move together with a combined velocity
        let totalVelocity = createVector(0, 0);
        let totalSize = this.size;

        for (let blob of blobs) {
            if (blob.merged) {
                totalVelocity.add(blob.velocity);
            }
        }

        totalVelocity.div(blobs.length); // Average velocity of merged blobs
        this.position.add(totalVelocity);

        // Check boundaries for the merged blob
        if (this.position.x <= 0 || this.position.x >= width) {
            totalVelocity.x *= -1;
        }
        if (this.position.y <= 0 || this.position.y >= height) {
            totalVelocity.y *= -1;
        }
    }
    }


    display() {
        fill(this.color);
        noStroke();
        ellipse(this.position.x, this.position.y, this.size);
    }

    checkEdges() {
        if (this.position.x <= 0 || this.position.x >= width) {
            this.velocity.x *= -1;
        }
        if (this.position.y <= 0 || this.position.y >= height) {
            this.velocity.y *= -1;
        }
    }

    isColliding(other) {
        let distance = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        return distance < (this.size / 2 + other.size / 2);
    }

    mergeWith(other) {
        if (!this.merged && !other.merged) {
            let totalSize = this.size + other.size;
            let newSize = totalSize * 0.7; 
            let newPosition = p5.Vector.lerp(this.position, other.position, this.size / totalSize);

            let combinedVelocity = p5.Vector.add(this.velocity, other.velocity).div(2); // Combine velocities and find average

            let speedFactor = 14;
            combinedVelocity.mult(speedFactor);

            this.size = newSize;
            this.position = newPosition;
            this.velocity = combinedVelocity;

            this.merged = true;
            other.merged = true;
        }
    }
  
}