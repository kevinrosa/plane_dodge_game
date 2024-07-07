const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 900,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Constants
const NUM_CIRCLES = 60;
const CIRCLE_RADIUS = 600;  // Starting distance from the center of the screen
const SPEED_MIN = 3;  // Pixels per frame
const SPEED_MAX = 4.5;
const FONT_COLOR = '#FFFFFF';

let plane;
let cursors;
let circles;
let score = 0;
let highScore = 0;
let scoreText;
let highScoreText;
let lastScoreUpdateTime = 0;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('plane', 'plane_23x24_v0.png');  // Use the created plane image
    this.load.image('circle', 'circle_8x8_v0.png'); // Use the created circle image
}

function create() {
    plane = this.physics.add.sprite(450, 450, 'plane').setCollideWorldBounds(true);

    circles = this.physics.add.group({
        key: 'circle',
        repeat: NUM_CIRCLES - 1,
        setXY: { x: 450, y: 450, stepX: 20 }
    });

    circles.children.iterate(function (circle) {
        const angle = Phaser.Math.Between(0, 360);
        const speed = Phaser.Math.Between(SPEED_MIN * 60, SPEED_MAX * 60);
        this.physics.velocityFromAngle(angle, speed, circle.body.velocity);
        circle.x += Math.cos(angle) * CIRCLE_RADIUS + Phaser.Math.Between(-50, 50);
        circle.y += Math.sin(angle) * CIRCLE_RADIUS + Phaser.Math.Between(-50, 50);
    }, this);

    this.physics.add.collider(plane, circles, hitCircle, null, this);

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '32px', fill: FONT_COLOR });
    highScoreText = this.add.text(10, 50, 'High Score: 0', { fontSize: '32px', fill: FONT_COLOR });

    lastScoreUpdateTime = this.time.now;
}

function update(time, delta) {
    // Update plane velocity based on keyboard input
    if (cursors.left.isDown) {
        plane.setVelocityX(-200);
        plane.angle = -15;
    } else if (cursors.right.isDown) {
        plane.setVelocityX(200);
        plane.angle = 15;
    } else {
        plane.setVelocityX(0);
        plane.angle = 0;
    }

    if (cursors.up.isDown) {
        plane.setVelocityY(-200);
    } else if (cursors.down.isDown) {
        plane.setVelocityY(200);
    } else {
        plane.setVelocityY(0);
    }

    // Update score based on elapsed time
    const elapsed = time - lastScoreUpdateTime;
    if (elapsed >= 10) { // Update score every 10 milliseconds
        score += Math.floor(elapsed / 10);
        scoreText.setText('Score: ' + score);
        lastScoreUpdateTime = time;
    }
}

function hitCircle(plane, circle) {
    if (score > highScore) {
        highScore = score;
        highScoreText.setText('High Score: ' + highScore);
    }
    score = 0;
    scoreText.setText('Score: ' + score);
    this.scene.restart();
}
