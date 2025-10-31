const mapContainer = document.getElementById("map-container");
const mapImg = document.getElementById("map");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const nextBtn = document.getElementById("next-btn");

// map dimension
const baseMapWidth = 1188;   // original map pixel width
const baseMapHeight = 1126;  // original map pixel height


// Welcoming message
document.getElementById("enter-btn").addEventListener("click", function() {
  const password = document.getElementById("password-input").value;
  const correctPassword = "filippo infame"; // 🔒 your password

  const welcomeScreen = document.getElementById("welcome-overlay");
  const mainContent = document.getElementById("main-content");
  const errorMsg = document.getElementById("error-msg");

  if (password === correctPassword) {
    // Start fade-out animation
    welcomeScreen.style.transition = "opacity 2.5s ease";
    welcomeScreen.style.opacity = 0;

    // After fade finishes, hide and show main content
    setTimeout(() => {
      welcomeScreen.style.display = "none";
      mainContent.style.display = "block";

      // Wait for layout to update, then position fogs
      setTimeout(positionFogs, 100);
    }, 2500);
  } else {
    errorMsg.style.display = "block";
  }
});

// Create fog elements
// Fog images
const fogBottom = document.createElement("img");
fogBottom.src = "assets/fog/fog_1.png";
fogBottom.classList.add("fog");

const fogTop = document.createElement("img");
fogTop.src = "assets/fog/fog_2.png";
fogTop.classList.add("fog");

const fogLeft = document.createElement("img");
fogLeft.src = "assets/fog/fog_1.png";
fogLeft.classList.add("fog");

const fogRight = document.createElement("img");
fogRight.src = "assets/fog/fog_2.png";
fogRight.classList.add("fog");

// Common styles
[fogTop, fogBottom, fogLeft, fogRight].forEach(fog => {
  fog.style.position = "absolute";
  fog.style.zIndex = "5";
  fog.style.pointerEvents = "none";
  mapContainer.appendChild(fog);
});

// Function to position all fogs around the map
function positionFogs() {
  const mapRect = mapImg.getBoundingClientRect();
  const mapTop = mapImg.offsetTop;
  const mapLeft = mapImg.offsetLeft;
  const mapWidth = mapImg.offsetWidth;
  const mapHeight = mapImg.offsetHeight;

  // Top fog
  fogTop.style.top = mapTop + "px";
  fogTop.style.left = mapLeft + "px";
  fogTop.style.width = mapWidth + "px";
  fogTop.style.height = fogTop.naturalHeight * (mapWidth / fogTop.naturalWidth) + "px";
  fogTop.style.transform = "rotate(180deg)";
  fogTop.style.transformOrigin = "center";

  // Bottom fog
  fogBottom.style.top = mapTop + mapHeight - (fogBottom.naturalHeight * (mapWidth / fogBottom.naturalWidth)) + "px";
  fogBottom.style.left = mapLeft + "px";
  fogBottom.style.width = mapWidth + "px";
  fogBottom.style.height = fogBottom.naturalHeight * (mapWidth / fogBottom.naturalWidth) + "px";
  fogBottom.style.transform = "rotate(0deg)";
  fogBottom.style.transformOrigin = "center";

  // Left fog
  fogLeft.style.top = mapTop + "px";
  fogLeft.style.left = mapLeft - (fogLeft.naturalWidth * (mapHeight / fogLeft.naturalHeight)) + "px";
  fogLeft.style.width = mapHeight + "px";
  fogLeft.style.height = fogLeft.naturalWidth * (mapHeight / fogLeft.naturalHeight) + "px";
  fogLeft.style.transform = "rotate(-90deg)";
  fogLeft.style.transformOrigin = "top left";

  // Right fog
  fogRight.style.top = mapTop + "px";
  fogRight.style.left = mapLeft + mapWidth + "px";
  fogRight.style.width = mapHeight + "px";
  fogRight.style.height = fogRight.naturalWidth * (mapHeight / fogRight.naturalHeight) + "px";
  fogRight.style.transform = "rotate(90deg)";
  fogRight.style.transformOrigin = "top left";
}

// Wait for all fogs to load then position
[fogTop, fogBottom, fogLeft, fogRight].forEach(fog => fog.onload = positionFogs);

// Recalculate on window resize
window.addEventListener("resize", positionFogs);

