var canvas = document.getElementById(`myCanvas`)
var ctx = canvas.getContext(`2d`)
var ballRadius = 10
var ballSpeed = 3
var x = canvas.width/2
var y = canvas.height-30
var dx = ballSpeed
var dy = ballSpeed * -1
var paddleHeight = 10
var paddleWidth = 75
var paddleX = (canvas.width-paddleWidth)/2
var rightPressed = false
var leftPressed = false
var brickRowCount = 5
var brickColumnCount = 3
var brickWidth = 75
var brickHeight = 20
var brickPadding = 10
var brickOffsetTop = 30
var brickOffsetLeft = 30
var score = 0
var lives = 3
var Events = {
  GAME_OVER: `GAME OVER`,
  NEXT_LEVEL: `NEXT LEVEL!`
}

var bricks = []
var level = 0

document.addEventListener(`keydown`, keyDownHandler, false)
document.addEventListener(`keyup`, keyUpHandler, false)
document.addEventListener(`mousemove`, mouseMoveHandler, false)

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true
    }
    else if(e.keyCode == 37) {
        leftPressed = true
    }
}
function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false
    }
    else if(e.keyCode == 37) {
        leftPressed = false
    }
}
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2
    }
}
function collisionDetection() {
    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
            var b = bricks[c][r]
            if(b.status == 1) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy
                    b.status = 0
                    score++
                    if(score == brickRowCount*brickColumnCount*(level + 1)) {
                      triggerEvent(Events.NEXT_LEVEL)
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath()
    ctx.arc(x, y, ballRadius, 0, Math.PI*2)
    ctx.fillStyle = `#f68f1e`
    ctx.fill()
    ctx.closePath()
}
function drawPaddle() {
    ctx.beginPath()
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight)
    ctx.fillStyle = `#f68f1e`
    ctx.fill()
    ctx.closePath()
}
function fillBricks() {
  for(c=0; c<brickColumnCount; c++) {
      bricks[c] = [];
      for(r=0; r<brickRowCount; r++) {
          bricks[c][r] = { x: 0, y: 0, status: 1 }
      }
  }
}
function drawBricks() {
    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
                var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft
                var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop
                bricks[c][r].x = brickX
                bricks[c][r].y = brickY
                ctx.beginPath()
                ctx.rect(brickX, brickY, brickWidth, brickHeight)
                ctx.fillStyle = `#ffffff`
                ctx.fill()
                ctx.closePath()
            }
        }
    }
}
function drawScore() {
    ctx.font = `16px Arial`
    ctx.fillStyle = `#a6a8ab`
    ctx.fillText(`Score: ${score}`, 8, 20)
}
function drawLives() {
    ctx.font = `16px Arial`
    ctx.fillStyle = `#a6a8ab`
    ctx.fillText(`Lives: ${lives-1}`, canvas.width-65, 20)
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawBricks()
    drawBall()
    drawPaddle()
    drawScore()
    drawLives()
    collisionDetection()

    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx
    }
    if(y + dy < ballRadius) {
        dy = -dy
    }
    else if(y + dy > canvas.height-ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy
        }
        else {
            lives--
            if(!lives) {
                triggerEvent(Events.GAME_OVER)
                return
            }
            else {
                ballSpeed++
                x = canvas.width/2
                y = canvas.height-30
                dx = ballSpeed
                dy = ballSpeed * -1
                paddleX = (canvas.width-paddleWidth)/2
            }
        }
    }

    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 7
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= 7
    }

    x += dx
    y += dy
    requestAnimationFrame(draw)
}

function triggerEvent(event) {
  if (Events.NEXT_LEVEL === event) {
    setTimeout(fillBricks, 1000)
    level++
    return
  }

  if (Events.GAME_OVER === event) {
    onGameEnd(score)
  }
}

function getTopScores() {
  fetch(`https://galvanize-leader-board.herokuapp.com/api/v1/leader-board/GBP`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json()
    })
    .then(scores => {
      renderTopScores(scores)
      return scores
    })
    .catch(err => alert(err))
}

function renderTopScores(scores) {
  var scoresHtml = scores.sort((a, b) => {
    return a.score < b.score
  }).slice(0, 3).map(game => {
    return `
    <p class="score-card">
      <span class="player-name">${game.player_name}</span>
      <span class="score">${game.score}</span>
    </p>
    `
  })

  scoresHtml.unshift(`<h1 class="scores-title">Top Scores</h1>`)

  document.querySelector('.scores').innerHTML = scoresHtml.join('')
}

function onGameEnd(finalScore) {
  alert(`Final Score: ${finalScore}`)

  fetch(`https://galvanize-leader-board.herokuapp.com/api/v1/leader-board`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        game_name: 'GBP',
        player_name: document.querySelector('.big-input').value,
        score: finalScore
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json()
    })
    .then(res => {
      getTopScores()
    })
    .catch(err => alert(err))
}

function startGame(e) {
  e.preventDefault()

  e.target.style.visibility = 'hidden'

  fillBricks()
  draw()
}

getTopScores()
