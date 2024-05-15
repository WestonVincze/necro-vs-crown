
const MainMenuScreen = () => `
  <div.
    <h1>NECRO</h1>

    <div id="content">
      PLAY GAME
    </div>

    <div>
      <button id="start_game_btn">Start Game</button>
    </div>
  </div>
`

export const MainMenu = () => {
  const overlay = document.querySelector('#overlay');
  if (!overlay) {
    console.error("overlay container not found.");
    return;
  }

  overlay.classList.add("show");
  overlay.innerHTML = MainMenuScreen();

  const handleStartGame = () => {
    overlay.classList.remove('show');
  }

  const startButton = document.querySelector('#start_game_btn');
  startButton?.addEventListener('click', handleStartGame);
}
