document.addEventListener('keydown', function(event) {
    if (event.key === ' ') {
        document.getElementById('startMessage').style.display = 'none';
        startGame();

        // Reproducir música de fondo
        const backgroundMusic = document.getElementById('backgroundMusic');
        backgroundMusic.play();
    }
});

function startGame() {
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let stars = [];
    let meteors = [];
    let keysPressed = {};
    let ship1Score = 0;
    let ship2Score = 0;
    const gameTime = 60000; // Duración del juego en milisegundos (60 segundos)
    const gameEndTime = Date.now() + gameTime;

    function createStars() {
        stars = [];
        for (let i = 0; i < 500; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2,
                alpha: Math.random()
            });
        }
    }

    function createMeteor() {
        return {
            x: Math.random() * canvas.width,
            y: -50, // Comienza arriba del canvas
            radius: 20,
            speed: Math.random() * 4 + 1, // Velocidad de caída
            angle: Math.PI / 2, // Ángulo hacia abajo
        };
    }

    function drawStars() {
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
            ctx.closePath();
        });
    }

    function drawMeteor(meteor) {
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'gray';
        ctx.fill();
        ctx.closePath();
    }

    function animateIntro() {
        const introMeteors = [];

        for (let i = 0; i < 20; i++) {
            introMeteors.push(createMeteor());
        }

        function drawIntro() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dibujar fondo
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dibujar meteoritos
            introMeteors.forEach(meteor => {
                meteor.y += meteor.speed;
                if (meteor.y > canvas.height) {
                    meteor.y = -50;
                    meteor.x = Math.random() * canvas.width;
                }
                drawMeteor(meteor);
            });

            requestAnimationFrame(drawIntro);
        }

        drawIntro();
    }

    // Inicializar estrellas y meteoritos
    createStars();
    for (let i = 0; i < 50; i++) {
        meteors.push(createMeteor());
    }

    // Naves
    const ship1 = {
        x: canvas.width / 4,
        y: canvas.height / 2,
        radius: 30,
        color: 'blue',
        speedY: 0,
        bullets: []
    };

    const ship2 = {
        x: (canvas.width / 4) * 3,
        y: canvas.height / 2,
        radius: 30,
        color: 'red',
        speedY: 0,
        bullets: []
    };

    function drawShip(ship) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.beginPath();
        ctx.moveTo(0, -ship.radius);
        ctx.lineTo(ship.radius, ship.radius);
        ctx.lineTo(-ship.radius, ship.radius);
        ctx.closePath();
        ctx.fillStyle = ship.color;
        ctx.fill();

        // Dibujar el rectángulo en la parte trasera
        ctx.fillStyle = 'gray';
        ctx.fillRect(-ship.radius / 2, ship.radius, ship.radius, ship.radius / 2);

        ctx.restore();
    }

    function drawBullet(bullet) {
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function updateSpace() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar fondo
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar estrellas
        drawStars();

        // Dibujar meteoritos
        meteors.forEach((meteor, meteorIndex) => {
            meteor.y += meteor.speed;
            if (meteor.y > canvas.height) {
                // Restablecer la posición del meteorito
                meteors.splice(meteorIndex, 1);
                meteors.push(createMeteor());
            }
            drawMeteor(meteor);

            // Comprobar colisiones con balas de ship1
            ship1.bullets.forEach((bullet, bulletIndex) => {
                if (checkCollision(bullet, meteor)) {
                    meteors.splice(meteorIndex, 1);
                    ship1.bullets.splice(bulletIndex, 1);
                    ship1Score += 10; // Incrementar puntuación
                    meteors.push(createMeteor());
                }
            });

            // Comprobar colisiones con balas de ship2
            ship2.bullets.forEach((bullet, bulletIndex) => {
                if (checkCollision(bullet, meteor)) {
                    meteors.splice(meteorIndex, 1);
                    ship2.bullets.splice(bulletIndex, 1);
                    ship2Score += 10; // Incrementar puntuación
                    meteors.push(createMeteor());
                }
            });
        });

        // Dibujar naves
        drawShip(ship1);
        drawShip(ship2);

        // Mover naves según las teclas presionadas
        moveShip(ship1, keysPressed);
        moveShip(ship2, keysPressed);

        // Dibujar y mover balas
        ship1.bullets.forEach((bullet, index) => {
            bullet.y += bullet.velocityY;
            drawBullet(bullet);

            // Eliminar bala si sale de la pantalla
            if (bullet.y > canvas.height || bullet.y < 0) {
                ship1.bullets.splice(index, 1);
            }
        });

        ship2.bullets.forEach((bullet, index) => {
            bullet.y += bullet.velocityY;
            drawBullet(bullet);

            // Eliminar bala si sale de la pantalla
            if (bullet.y > canvas.height || bullet.y < 0) {
                ship2.bullets.splice(index, 1);
            }
        });

        // Comprobar si el juego ha terminado
        if (Date.now() > gameEndTime) {
            endGame();
        } else {
            requestAnimationFrame(updateSpace);
        }
    }

    function moveShip(ship, keys) {
        if (ship === ship1) {
            if (keys['ArrowUp']) {
                ship.y = Math.max(ship.radius, ship.y - 5);
            }
            if (keys['ArrowDown']) {
                ship.y = Math.min(canvas.height - ship.radius, ship.y + 5);
            }
            if (keys['ArrowLeft']) {
                ship.x = Math.max(ship.radius, ship.x - 5);
            }
            if (keys['ArrowRight']) {
                ship.x = Math.min(canvas.width - ship.radius, ship.x + 5);
            }
            if (keys['Enter']) {
                const bulletY = ship.y - ship.radius;
                ship.bullets.push({
                    x: ship.x,
                    y: bulletY,
                    radius: 5,
                    color: 'blue',
                    velocityY: -10
                });
                playShootSound();
            }
        } else if (ship === ship2) {
            if (keys['w']) {
                ship.y = Math.max(ship.radius, ship.y - 5);
            }
            if (keys['s']) {
                ship.y = Math.min(canvas.height - ship.radius, ship.y + 5);
            }
            if (keys['a']) {
                ship.x = Math.max(ship.radius, ship.x - 5);
            }
            if (keys['d']) {
                ship.x = Math.min(canvas.width - ship.radius, ship.x + 5);
            }
            if (keys['f']) {
                const bulletY = ship.y - ship.radius;
                ship.bullets.push({
                    x: ship.x,
                    y: bulletY,
                    radius: 5,
                    color: 'red',
                    velocityY: -10
                });
                playShootSound();
            }
        }
    }

    function playShootSound() {
        const shootSound = document.getElementById('shootSound');
        shootSound.currentTime = 0; // Reiniciar el sonido al inicio
        shootSound.play();
    }

    function checkCollision(obj1, obj2) {
        const distX = obj1.x - obj2.x;
        const distY = obj1.y - obj2.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        return distance < obj1.radius + obj2.radius;
    }

    function endGame() {
        // Mostrar el mensaje de fin de juego y los puntajes
        const winner = ship1Score > ship2Score ? 'Ship 1' : 'Ship 2';
        alert(`Game Over! ${winner} wins! \nShip 1 Score: ${ship1Score} \nShip 2 Score: ${ship2Score}`);
        
        // Recargar la página para reiniciar el juego
        location.reload();
    }

    // Manejar eventos de teclas presionadas
    document.addEventListener('keydown', function(event) {
        keysPressed[event.key] = true;
    });

    document.addEventListener('keyup', function(event) {
        keysPressed[event.key] = false;
    });

    // Ajustar el tamaño del canvas y recrear las estrellas al redimensionar la ventana
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStars();
    });

    // Iniciar la animación
    updateSpace();
}

