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

  marker.addEventListener("click", () => showDialogue(scene));

  mapContainer.appendChild(marker);
}


// Show dialogue sequence for a scene
let currentScene = null;
let currentDialogueIndex = 0;
let typingTimeout = null;
let isTyping = false;

function showDialogue(scene) {
  currentScene = scene;
  currentDialogueIndex = 0;

  dialogueBox.style.display = "block";
  showNextDialogueLine();
}

// Show the next line of dialogue
function showNextDialogueLine() {
  // If text is still typing, skip to full text
  if (isTyping) {
    finishTyping();
    return;
  }

  const dialogue = currentScene.dialogue[currentDialogueIndex];

  // If no more lines, close dialogue and go to password
  if (!dialogue) {
    dialogueBox.style.display = "none";
    if (currentScene.next_scene) checkPasswordAndUnlock(currentScene);
    return;
  }

  // Show speaker, picture, and text
  const speakerElem = document.getElementById("speaker-name");
  const textElem = document.getElementById("dialogue-text");
  const picElem = document.getElementById("speaker-pic");

  if (typeof dialogue === "string") {
    // Handle old single-line format
    speakerElem.textContent = "";
    picElem.style.display = "none"; // hide image if no speaker
    startTyping(dialogue, textElem);
  } else {
    speakerElem.textContent = dialogue.speaker || "";
    picElem.src = `assets/pic/${dialogue.speaker}.png`;
    picElem.style.display = "block"; // show image
    startTyping(dialogue.text, textElem);
  }

  currentDialogueIndex++;
}

// Typing animation
function startTyping(text, element) {
  element.textContent = "";
  let i = 0;
  isTyping = true;
  nextBtn.disabled = false;

  function typeChar() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      typingTimeout = setTimeout(typeChar, 25); // speed (ms per character)
    } else {
      finishTyping();
    }
  }

  typeChar();
}

// Finish typing immediately
function finishTyping() {
  clearTimeout(typingTimeout);

  const dialogue = currentScene.dialogue[currentDialogueIndex - 1];
  const textElem = document.getElementById("dialogue-text");

  // Show the full line immediately
  if (typeof dialogue === "string") {
    textElem.textContent = dialogue;
  } else {
    textElem.textContent = dialogue.text;
  }

  isTyping = false;
}


// Go to next line when clicking "Avanti"
nextBtn.onclick = () => {
  if (isTyping) {
    finishTyping(); // show full line
  } else {
    showNextDialogueLine(); // go to next
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

