const mapContainer = document.getElementById("map-container");
const mapImg = document.getElementById("map");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const nextBtn = document.getElementById("next-btn");


// map dimension
const baseMapWidth = 1188;   // original map pixel width
const baseMapHeight = 1126;  // original map pixel height


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




// Portraits bar
const characterBar = document.getElementById("character-bar");
const profileOverlay = document.getElementById("profile-overlay");
const profileImg = document.getElementById("profile-img");

const characters = [
  "Avvocato",
  "Custode",
  "Dottore",
  "Giornalista",
  "Giudice",
  "Ingegnere",
  "Manager",
  "Poliziotto",
  "Prete",
  "Segretaria"
];

// Add small portraits to the bar
characters.forEach(speaker => {
  const img = document.createElement("img");
  img.src = `assets/pic/${speaker}.png`;
  img.dataset.name = speaker;

  img.addEventListener("click", () => {
    profileImg.src = `assets/profile/${speaker}.png`;
    profileOverlay.style.display = "flex";
  });

  characterBar.appendChild(img);
});

// Close overlay when clicked
profileOverlay.addEventListener("click", () => {
  profileOverlay.style.display = "none";
});




// Load scenes.json
fetch('data/scenes.json')
  .then(response => response.json())
  .then(data => {
    scenes = data;
    initMarkers();
  })
  .catch(err => console.error("Failed to load scenes.json:", err));

// Function to initialize markers
function initMarkers() {
    scenes.forEach(scene => {
        if(scene.unlocked) {
            addMarker(scene);
        }
    });
}

// Function to create a marker
function addMarker(scene) {
  const map = document.getElementById("map");
  const mapContainer = document.getElementById("map-container");

  const marker = document.createElement("img");

  marker.src = scene.icon;

  marker.id = `marker_${scene.id}`;
  marker.style.position = "absolute";
  marker.style.width = "32px";
  marker.style.height = "32px";
  marker.style.cursor = "pointer";
  marker.style.zIndex = "10";
  marker.title = scene.id;

  // Convert pixel coords to percentages
  const xPct = (scene.coords[0] / baseMapWidth) * 100;
  const yPct = (scene.coords[1] / baseMapHeight) * 100;

  marker.style.left = `${xPct}%`;
  marker.style.top = `${yPct}%`;
  marker.style.transform = "translate(-50%, -50%)"; // center the icon
  
  marker.addEventListener("click", () => showObject(scene, () => startDialogue(scene)));

  mapContainer.appendChild(marker);
}

function startScene(scene) {
  // Show object (if any), then dialogue
  showObject(scene, () => startDialogue(scene));
}

// show object
function showObject(scene, callback) {
  if (!scene.object) {
    // no object → start dialogue immediately
    callback();
    return;
  }

  // Make sure we treat a single string as an array
  const pages = Array.isArray(scene.object) ? scene.object : [scene.object];
  let currentPage = 0;

  const container = document.createElement("div");
  container.classList.add("object-container");

  const img = document.createElement("img");
  img.src = pages[currentPage];
  img.classList.add("object-image");
  container.appendChild(img);
  document.body.appendChild(container);

  // Click to go to next page or close
  img.addEventListener("click", () => {
    currentPage++;

    if (currentPage < pages.length) {
      // show next page
      img.src = pages[currentPage];
    } else {
      // end of diary: fade out + callback
      container.classList.add("fade-out");
      setTimeout(() => {
        container.remove();
        callback();
      }, 500);
    }
  });
}

// Show dialogue sequence for a scene
let currentDialogueIndex = 0;
let currentScene = null;
let isTyping = false;
let typingTimeout = null;
let lastSpeaker = null;
const speakerSides = {}; // help reset each scene and store sides for each speaker globally


// Start dialogue
function startDialogue(scene) {
  // if there is no dialogue
  if (!scene.dialogue || scene.dialogue.length === 0) return;

  // stop any previous typing
  if (typingTimeout) clearTimeout(typingTimeout);
  isTyping = false;

  currentScene = scene;
  currentDialogueIndex = 0;
  lastSpeaker = null;

  // clear bubbles from previous scene
  const container = document.getElementById("dialogue-container");
  container.innerHTML = "";
  // reset speaker sides for this scene
  Object.keys(speakerSides).forEach(key => delete speakerSides[key]);

  // show the box and start
  const dialogueBox = document.getElementById("dialogue-box")
  dialogueBox.style.display = "block";
  showNextDialogueLine();
}


// Show the next line of dialogue
function showNextDialogueLine() {
  if (!currentScene) return;
  const dialogue = currentScene.dialogue[currentDialogueIndex];
  const container = document.getElementById("dialogue-container");
  
  // End of dialogue
  if (!dialogue) {
    // If a password is required for the next scene
    if (currentScene.next_scene) {
      checkPasswordAndUnlock(currentScene);
    }
    document.getElementById("dialogue-box").style.display = "none";
    currentScene = null;
    return;
  }

  // Create bubble
  const bubble = document.createElement("div");
  bubble.classList.add("speech-bubble");

  // Determine left/right
  let sideClass;
  if (speakerSides[dialogue.speaker]) {
    sideClass = speakerSides[dialogue.speaker]; // use previous side
  } else {
    // Alternate sides if first time
    sideClass = (Object.keys(speakerSides).length % 2 === 0) ? "speech-left" : "speech-right";
    speakerSides[dialogue.speaker] = sideClass;
  }

  bubble.classList.add(sideClass);

  // Add speaker image
  if (dialogue.speaker) {
    const img = document.createElement("img");
    img.src = `assets/pic/${dialogue.speaker}.png`;
    bubble.appendChild(img);
  }

  // Add text container
  const textContainer = document.createElement("div");
  if (dialogue.speaker) {
    const nameElem = document.createElement("div");
    nameElem.classList.add("speaker-name");
    nameElem.textContent = dialogue.speaker;
    textContainer.appendChild(nameElem);
  }

  const textElem = document.createElement("div");
  textContainer.appendChild(textElem);

  bubble.appendChild(textContainer);
  container.appendChild(bubble);

  lastSpeaker = dialogue.speaker;

  // Typing animation
  typeText(dialogue.text, textElem, () => {});

  currentDialogueIndex++;
}


// Typing animation
function typeText(text, elem, callback) {
  let index = 0;
  elem.textContent = "";
  isTyping = true;

  function typeChar() {
    elem.textContent += text[index];
    index++;

    // Scroll the container as text grows
    const container = document.getElementById("dialogue-container");
    container.scrollTop = container.scrollHeight;
    
    if (index < text.length) {
      typingTimeout = setTimeout(typeChar, 30);
    } else {
      isTyping = false;
      callback();
    }
  }
  typeChar();
}

// Next button behavior
document.getElementById("next-btn").onclick = () => {
  if (!currentScene) return; // do nothing if no scene active

  if (isTyping) {
    // finish typing immediately
    clearTimeout(typingTimeout);
    const dialogue = currentScene.dialogue[currentDialogueIndex - 1];
    const container = document.getElementById("dialogue-container");
    const bubbles = container.querySelectorAll(".speech-bubble");
    const lastText = bubbles[bubbles.length - 1].querySelector("div:last-child div:last-child");
    lastText.textContent = dialogue.text;
    isTyping = false;
  } else {
    showNextDialogueLine();
  }
};









// unlock next scene
function checkPasswordAndUnlock(scene) {
  const nextScene = scenes.find(s => s.id === scene.next_scene);
  if (!nextScene) return;

  // If no password required, unlock immediately
  if (!scene.password || scene.password.trim() === "") {
    // addMarker(nextScene);
    unlockScene(nextScene);
    return;
  }

  // Show modal
  const modal = document.getElementById("password-modal");
  const input = document.getElementById("password-input");
  const submitBtn = document.getElementById("password-submit");
  const cancelBtn = document.getElementById("password-cancel");

  modal.style.display = "block";
  input.value = "";
  input.focus();

  const closeModal = () => {
    modal.style.display = "none";
    submitBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  submitBtn.onclick = () => {
    const userInput = input.value.trim().toLowerCase();
    if (userInput === scene.password.toLowerCase()) {
      closeModal();
      unlockScene(nextScene);
    } else {
      input.value = "";
      input.placeholder = "Password errata!";
    }
  };

  cancelBtn.onclick = closeModal;
}

// Unlocks and shows alert
function unlockScene(scene) {
  scene.unlocked = true;
  addMarker(scene);
  showUnlockAlert(scene.name);
}

// Smooth alert
function showUnlockAlert(sceneName) {
  const alertBox = document.getElementById("unlock-alert");
  const alertText = document.getElementById("unlock-alert-text");
  alertText.textContent = `Hai sbloccato: ${sceneName}!`;

  alertBox.classList.add("show");

  // Hide after 1s or if clicked
  const hide = () => {
    alertBox.classList.remove("show");
    setTimeout(() => (alertBox.style.display = "none"), 400);
    alertBox.removeEventListener("click", hide);
  };

  alertBox.style.display = "block";
  alertBox.addEventListener("click", hide);

  setTimeout(hide, 1000);
}

