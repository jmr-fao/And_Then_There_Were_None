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

  // Ask for the password
  const userInput = prompt("Inserisci la parola chiave per sbloccare il prossimo luogo:");

  if (userInput && userInput.toLowerCase() === scene.password.toLowerCase()) {
    unlockScene(nextScene);
  } else {
    alert("Password errata. Riprova!");
  }
}

function unlockScene(scene) {
  scene.unlocked = true;
  addMarker(scene);

  alert(`Hai sbloccato: ${scene.name}!`);
}
