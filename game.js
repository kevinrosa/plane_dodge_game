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

let plane;
let cursors;
let circles;
let score = 0;
let highScore = 0;
let scoreText;
let highScoreText;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('plane', 'ship_23x24_v0.png');  
    this.load.image('circle', 'circle_8x8_v0.png'); 
}

function create() {
    plane = this.physics.add.sprite(450, 450, 'plane').setCollideWorldBounds(true);

    circles = this.physics.add.group({
        key: 'circle',
        repeat: 59,
        setXY: { x: 450, y: 450, stepX: 20 }
    });

    circles.children.iterate(function (circle) {
        const angle = Phaser.Math.Between(0, 360);
        const speed = Phaser.Math.Between(30, 45);
        this.physics.velocityFromAngle(angle, speed, circle.body.velocity);
        circle.x += Math.cos(angle) * 600 + Phaser.Math.Between(-50, 50);
        circle.y += Math.sin(angle) * 600 + Phaser.Math.Between(-50, 50);
    }, this);

    this.physics.add.collider(plane, circles, hitCircle, null, this);

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
    highScoreText = this.add.text(10, 50, 'High Score: 0', { fontSize: '32px', fill: '#FFF' });

    this.time.addEvent({ delay: 100, callback: updateScore, callbackScope: this, loop: true });
}

function update() {
    if (cursors.left.isDown) {
        plane.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        plane.setVelocityX(200);
    } else {
        plane.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        plane.setVelocityY(-200);
    } else if (cursors.down.isDown) {
        plane.setVelocityY(200);
    } else {
        plane.setVelocityY(0);
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

function updateScore() {
    score += 1;
    scoreText.setText('Score: ' + score);
}
