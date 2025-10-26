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

// Show dialogue and unlock next scene
function showDialogue(scene) {
  dialogueBox.style.display = "block";
  dialogueText.textContent = scene.dialogue;

  nextBtn.onclick = () => {
    dialogueBox.style.display = "none";
    if (scene.next_scene) checkPasswordAndUnlock(scene);
  };
}

function checkPasswordAndUnlock(scene) {
  const nextScene = scenes.find(s => s.id === scene.next_scene);
  if (!nextScene) return;

  // If no password required, unlock immediately
  if (!scene.password || scene.password.trim() === "") {
    addMarker(nextScene);
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

function unlockScene(scene) {
  scene.unlocked = true;
  addMarker(scene);

  //alert(`Hai sbloccato: ${scene.name}!`);
  showUnlockAlert(scene.name);
}

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

