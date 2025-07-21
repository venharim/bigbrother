// script.js

document.getElementById("setup-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const numPlayers = parseInt(document.getElementById("numPlayers").value);
  const playersInput = document.getElementById("players-input");
  playersInput.innerHTML = "";

  for (let i = 0; i < numPlayers; i++) {
    const label = document.createElement("label");
    label.textContent = `Houseguest ${i + 1} Name:`;
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.required = true;
    nameInput.name = `name-${i}`;

    const imgLabel = document.createElement("label");
    imgLabel.textContent = `Houseguest ${i + 1} Image URL:`;
    const imgInput = document.createElement("input");
    imgInput.type = "text";
    imgInput.required = true;
    imgInput.name = `img-${i}`;

    playersInput.appendChild(label);
    playersInput.appendChild(nameInput);
    playersInput.appendChild(imgLabel);
    playersInput.appendChild(imgInput);
  }

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Begin Simulation";
  submitBtn.type = "button";
  submitBtn.addEventListener("click", startGame);
  playersInput.appendChild(submitBtn);
});

let houseguests = [];
let evicted = [];
let week = 1;

function startGame() {
  const form = document.getElementById("setup-form");
  const gameArea = document.getElementById("game-area");
  const inputs = form.querySelectorAll("input[type='text']");

  houseguests = [];
  for (let i = 0; i < inputs.length; i += 2) {
    const name = inputs[i].value;
    const img = inputs[i + 1].value;
    houseguests.push({ name, img });
  }

  form.style.display = "none";
  gameArea.style.display = "block";
  simulateWeek();
}

function simulateWeek() {
  if (houseguests.length <= 2) {
    declareWinner();
    return;
  }

  const log = document.getElementById("game-log");
  const tableBody = document.querySelector("#voting-chart tbody");

  let hoh = randomPick(houseguests);
  let nominees = randomPickMultiple(houseguests.filter(p => p !== hoh), 2);
  let pov = randomPick(houseguests);

  let vetoUsed = Math.random() < 0.5;
  if (vetoUsed && !nominees.includes(pov)) {
    let replacement = randomPick(
      houseguests.filter(p => ![hoh, ...nominees, pov].includes(p))
    );
    if (replacement) {
      nominees[0] = replacement;
    }
  }

  let voters = houseguests.filter(p => ![...nominees, hoh].includes(p));
  let evicted = randomPick(nominees);
  let votes = voters.map(v => `${v.name} → ${evicted.name}`);

  // Logging to page
  log.innerHTML += `<strong>Week ${week}</strong><br>HOH: ${hoh.name}<br>Nominations: ${nominees.map(n => n.name).join(" & ")}<br>POV Winner: ${pov.name}${vetoUsed ? " (used)" : " (not used)"}<br>Evicted: ${evicted.name}<br><br>`;

  // Add row to voting chart
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${week}</td>
    <td>${hoh.name}</td>
    <td>${nominees.map(n => n.name).join(" & ")}</td>
    <td>${pov.name}${vetoUsed ? "*" : ""}</td>
    <td>${evicted.name}</td>
    <td>${votes.join("<br>")}</td>
  `;
  tableBody.appendChild(row);

  // Remove evicted player
  houseguests = houseguests.filter(p => p !== evicted);
  week++;

  setTimeout(simulateWeek, 1000);
}

function declareWinner() {
  const log = document.getElementById("game-log");
  const [finalist1, finalist2] = houseguests;
  let juryVotes = [];

  for (let i = 0; i < 7; i++) {
    let vote = Math.random() < 0.5 ? finalist1 : finalist2;
    juryVotes.push(vote.name);
  }

  let winner = juryVotes.filter(v => v === finalist1.name).length > 3 ? finalist1 : finalist2;
  log.innerHTML += `<strong>Final 2:</strong> ${finalist1.name} vs ${finalist2.name}<br>`;
  log.innerHTML += `Jury Votes: ${juryVotes.join(", ")}<br>`;
  log.innerHTML += `<strong>Winner: ${winner.name}</strong><br>`;
}

function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomPickMultiple(array, num) {
  let copy = [...array];
  let result = [];
  while (result.length < num && copy.length) {
    let pick = randomPick(copy);
    result.push(pick);
    copy = copy.filter(p => p !== pick);
  }
  return result;
}
