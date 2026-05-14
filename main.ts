// 2D Basketball Game - First to 3 or Most Points in 2:30
// Use W key for LEFT player, O key for RIGHT player

// Game Variables
let leftScore = 0
let rightScore = 0
let gameActive = true
let timeRemaining = 150 // 2 minutes 30 seconds in seconds
let tickingSoundActive = false
let timerBlinkState = false

// Sprite Variables
let leftPlayer: Sprite
let rightPlayer: Sprite
let basketball: Sprite
let leftNet: Sprite
let rightNet: Sprite

// Physics Variables
const GRAVITY = 150
const JUMP_POWER = 150
const BALL_BOUNCE = 0.75
let ballVelocityY = 0
let ballVelocityX = 0

// Initialize Game
function initGame() {
    scene.setBackgroundColor(15) // Light background color
    
    // Create LEFT PLAYER (Blue)
    // TODO: Replace with your drawn leftPlayer asset
    leftPlayer = sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . 9 9 . . . . . . .
        . . . . . . 9 9 9 9 . . . . . .
        . . . . . . 9 9 9 9 . . . . . .
        . . . . . . . 9 9 . . . . . . .
        . . . . . . 9 9 9 9 . . . . . .
        . . . . . . 9 9 9 9 . . . . . .
        . . . . . . . 9 9 . . . . . . .
    `, SpriteKind.Player)
    leftPlayer.setPosition(20, 100)
    leftPlayer.vx = 0
    
    // Create RIGHT PLAYER (Purple)
    // TODO: Replace with your drawn rightPlayer asset
    rightPlayer = sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . 5 5 . . . . . . .
        . . . . . . 5 5 5 5 . . . . . .
        . . . . . . 5 5 5 5 . . . . . .
        . . . . . . . 5 5 . . . . . . .
        . . . . . . 5 5 5 5 . . . . . .
        . . . . . . 5 5 5 5 . . . . . .
        . . . . . . . 5 5 . . . . . . .
    `, SpriteKind.Player)
    rightPlayer.setPosition(140, 100)
    rightPlayer.vx = 0
    
    // Create BASKETBALL
    // TODO: Replace with your drawn basketball asset
    basketball = sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . 8 8 . . . . . .
        . . . . . . . 8 8 8 8 . . . . .
        . . . . . . . 8 8 8 8 . . . . .
        . . . . . . . . 8 8 . . . . . .
        . . . . . . . . . . . . . . . .
    `, SpriteKind.Food)
    basketball.setPosition(80, 50)
    ballVelocityY = 0
    ballVelocityX = 0
    
    // Create LEFT NET (goal for RIGHT team to score)
    // TODO: Replace with your drawn net asset
    leftNet = sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . 1 1 1 1 . . . . . .
        . . . . . . 1 . . 1 . . . . . .
        . . . . . . 1 . . 1 . . . . . .
        . . . . . . 1 1 1 1 . . . . . .
        . . . . . . . . . . . . . . . .
    `, SpriteKind.Projectile)
    leftNet.setPosition(15, 80)
    
    // Create RIGHT NET (goal for LEFT team to score)
    // TODO: Replace with your drawn net asset
    rightNet = sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . 1 1 1 1 . . . . . .
        . . . . . . 1 . . 1 . . . . . .
        . . . . . . 1 . . 1 . . . . . .
        . . . . . . 1 1 1 1 . . . . . .
        . . . . . . . . . . . . . . . .
    `, SpriteKind.Projectile)
    rightNet.setPosition(145, 80)
}

// Handle Player Input
controller.onEvent(ControllerButtonEvent.Pressed, controller_button.A, function () {
    // W key = LEFT player jump
    if (leftPlayer.y > 90) {
        leftPlayer.vy = -JUMP_POWER
    }
})

controller.onEvent(ControllerButtonEvent.Pressed, controller_button.B, function () {
    // O key = RIGHT player jump
    if (rightPlayer.y > 90) {
        rightPlayer.vy = -JUMP_POWER
    }
})

// Update Game Physics
function updatePhysics() {
    // LEFT PLAYER gravity & bounds
    leftPlayer.ay = GRAVITY
    if (leftPlayer.y > 100) {
        leftPlayer.y = 100
        leftPlayer.vy = 0
    }
    
    // RIGHT PLAYER gravity & bounds
    rightPlayer.ay = GRAVITY
    if (rightPlayer.y > 100) {
        rightPlayer.y = 100
        rightPlayer.vy = 0
    }
    
    // BASKETBALL physics
    ballVelocityY += GRAVITY / 60 // Apply gravity
    basketball.y += ballVelocityY / 60
    basketball.x += ballVelocityX / 60
    
    // Ball bounce off ground
    if (basketball.y > 110) {
        basketball.y = 110
        ballVelocityY = ballVelocityY * -BALL_BOUNCE
        if (Math.abs(ballVelocityY) < 5) {
            ballVelocityY = 0
        }
    }
    
    // Ball bounds (left/right)
    if (basketball.x < 10) {
        basketball.x = 10
        ballVelocityX = Math.abs(ballVelocityX)
    }
    if (basketball.x > 150) {
        basketball.x = 150
        ballVelocityX = -Math.abs(ballVelocityX)
    }
}

// Check if Ball Enters Net
function checkScoring() {
    // RIGHT team scores (ball in LEFT net)
    if (basketball.overlapsWith(leftNet) && ballVelocityX < 0) {
        rightScore += 1
        resetBall()
        checkWinCondition()
    }
    
    // LEFT team scores (ball in RIGHT net)
    if (basketball.overlapsWith(rightNet) && ballVelocityX > 0) {
        leftScore += 1
        resetBall()
        checkWinCondition()
    }
}

// Check if players hit ball
function checkPlayerBallCollision() {
    // LEFT player hits ball
    if (leftPlayer.overlapsWith(basketball)) {
        ballVelocityY = -100
        ballVelocityX = 80
    }
    
    // RIGHT player hits ball
    if (rightPlayer.overlapsWith(basketball)) {
        ballVelocityY = -100
        ballVelocityX = -80
    }
}

// Reset Ball to Center
function resetBall() {
    basketball.setPosition(80, 50)
    ballVelocityY = 0
    ballVelocityX = 0
}

// Check Win Conditions
function checkWinCondition() {
    // First to 3 wins
    if (leftScore >= 3) {
        endGame("LEFT TEAM WINS!")
    } else if (rightScore >= 3) {
        endGame("RIGHT TEAM WINS!")
    }
}

// Update Timer & Check for 15 Second Warning
function updateTimer() {
    timeRemaining -= 1
    
    // Ticking sound & blinking when 15 seconds left
    if (timeRemaining <= 15 && timeRemaining > 0) {
        if (!tickingSoundActive) {
            tickingSoundActive = true
        }
        
        // Play ticking sound every second
        music.playTone(400, music.beat(BeatFraction.Sixteenth))
        
        // Toggle blink state every frame for red/white effect
        timerBlinkState = !timerBlinkState
    }
    
    if (timeRemaining <= 0) {
        endGame("TIME'S UP!")
    }
}

// End Game & Determine Winner
function endGame(message: string) {
    gameActive = false
    
    // Determine final winner
    let winner = ""
    if (leftScore > rightScore) {
        winner = "LEFT TEAM WINS!"
    } else if (rightScore > leftScore) {
        winner = "RIGHT TEAM WINS!"
    } else {
        winner = "IT'S A TIE!"
    }
    
    game.over(LOSE, effects.melt)
}

// Display HUD (Score & Timer)
function displayHUD() {
    // Left Score
    screen.print("LEFT: " + leftScore, 5, 5, 1, image.font5)
    
    // Right Score
    screen.print("RIGHT: " + rightScore, 120, 5, 1, image.font5)
    
    // Timer (convert seconds to MM:SS format)
    let minutes = Math.floor(timeRemaining / 60)
    let seconds = timeRemaining % 60
    let timerText = minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    
    // Blink timer red/white when 15 seconds left
    if (timeRemaining <= 15 && timeRemaining > 0) {
        let timerColor = timerBlinkState ? 2 : 1 // 2 = red, 1 = white
        screen.print(timerText, 70, 5, timerColor, image.font5)
    } else {
        screen.print(timerText, 70, 5, 1, image.font5)
    }
}

// Main Game Loop
initGame()
game.onUpdate(function () {
    if (gameActive) {
        updatePhysics()
        checkPlayerBallCollision()
        checkScoring()
        updateTimer()
        displayHUD()
    }
})

// Game runs at 60 FPS
