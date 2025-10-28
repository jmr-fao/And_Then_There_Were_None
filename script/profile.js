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
