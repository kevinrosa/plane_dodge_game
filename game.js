// Global Constants
const SCREEN_WIDTH = 900;
const SCREEN_HEIGHT = 900;
const NUM_CIRCLES = 100;
const CIRCLE_RADIUS = 600;  // Starting distance from the center of the screen
const SPEED_MIN = 2;  // Pixels per frame
const SPEED_MAX = 2;
const FONT_COLOR = '#FFFFFF';

// Phaser Config
const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
    plane = this.physics.add.sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'plane').setCollideWorldBounds(true);

    circles = this.physics.add.group({
        key: 'circle',
        repeat: NUM_CIRCLES - 1,
        setXY: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2, stepX: 20 }
    });

    circles.children.iterate(function (circle) {
        const angle = Phaser.Math.Between(0, 360);
        const speed = Phaser.Math.Between(SPEED_MIN * 60, SPEED_MAX * 60);
        this.physics.velocityFromAngle(angle, speed, circle.body.velocity);
        circle.x = SCREEN_WIDTH / 2 + Math.cos(angle) * CIRCLE_RADIUS + Phaser.Math.Between(-50, 50);
        circle.y = SCREEN_HEIGHT / 2 + Math.sin(angle) * CIRCLE_RADIUS + Phaser.Math.Between(-50, 50);
    }, this);

    this.physics.add.collider(plane, circles, hitCircle, null, this);

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '32px', fill: FONT_COLOR });
    highScoreText = this.add.text(10, 50, 'High Score: ' + highScore, { fontSize: '32px', fill: FONT_COLOR });

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

    // Wrap circles around the screen
    circles.children.iterate(function (circle) {
        if (circle.x < 0) circle.x = SCREEN_WIDTH;
        if (circle.x > SCREEN_WIDTH) circle.x = 0;
        if (circle.y < 0) circle.y = SCREEN_HEIGHT;
        if (circle.y > SCREEN_HEIGHT) circle.y = 0;
    });
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
