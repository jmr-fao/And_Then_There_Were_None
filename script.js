const mapContainer = document.getElementById("map-container");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const nextBtn = document.getElementById("next-btn");

// Load fogs from JSON
fetch('data/fog_side.json')
  .then(response => response.json())
  .then(fogs => addFogs(fogs))
  .catch(err => console.error("Failed to load fogs.json:", err));

function addFogs(fogs) {
  fogs.forEach(fog => {
    const fogImg = document.createElement("img");
    fogImg.src = fog.src;
    fogImg.id = fog.id;
    fogImg.classList.add("fog");

    fogImg.style.position = "absolute";
    fogImg.style.left = fog.x + "px";
    fogImg.style.top = fog.y + "px";
    
    fogImg.style.opacity = "0.85";  // Adjust for subtle transparency
    fogImg.style.zIndex = "5";
    fogImg.style.pointerEvents = "none"; // Prevent blocking clicks

    //fogImg.style.setProperty('--rotation', `${fog.rotation}deg`);
    //fogImg.style.setProperty('--scale', fog.scale);
    fogImg.style.transform = `rotate(${fog.rotation}deg) scale(${fog.scale})`;

    mapContainer.appendChild(fogImg);
  });
}

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
  const marker = document.createElement("img");

  marker.src = scene.icon;
  marker.id = `marker_${scene.id}`;
  marker.style.position = "absolute";
  marker.style.left = scene.coords[0] + "px";
  marker.style.top = scene.coords[1] + "px";
  marker.style.width = "32px";
  marker.style.height = "32px";
  marker.style.cursor = "pointer";
  marker.style.zIndex = "10";
  marker.title = scene.id;

  marker.addEventListener("click", () => startDialogue(scene));

  mapContainer.appendChild(marker);
}


// Show dialogue sequence for a scene
let currentDialogueIndex = 0;
let currentScene = null;
let isTyping = false;
let typingTimeout = null;
let lastSpeaker = null;


// Start dialogue
function startDialogue(scene) {
  if (!scene.dialogue || scene.dialogue.length === 0) return;

  currentScene = scene;
  currentDialogueIndex = 0;
  lastSpeaker = null;

  const dialogueBox = document.getElementById("dialogue-box")
  dialogueBox.style.display = "block";
  showNextDialogueLine();
}

// Show the next line of dialogue
const speakerSides = {}; // store sides for each speaker globally
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

  // Hide after 2.5s or if clicked
  const hide = () => {
    alertBox.classList.remove("show");
    setTimeout(() => (alertBox.style.display = "none"), 400);
    alertBox.removeEventListener("click", hide);
  };

  alertBox.style.display = "block";
  alertBox.addEventListener("click", hide);

  setTimeout(hide, 2500);
}

