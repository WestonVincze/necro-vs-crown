
const MainMenuScreen = () => `
  <div>
    <h1>NECRO</h1>

    <button id="start_as_necro">Join as Necro</button>
    <button id="start_as_crown">Join as Crown</button>
  </div>
`
interface MainMenuProps {
  startGame: (player: string) => void;
}

export const MainMenu = ({ startGame }: MainMenuProps) => {
  const overlay = document.querySelector('#overlay');
  if (!overlay) {
    console.error("overlay container not found.");
    return;
  }

  overlay.classList.add("show");
  overlay.innerHTML = MainMenuScreen();

  const handleStartGame = (player: string) => {
    startGame(player);
    overlay.classList.remove('show');
  }

  const startAsNecro = document.querySelector('#start_as_necro');
  const startAsCrown = document.querySelector('#start_as_crown');
  startAsNecro?.addEventListener('click', () => handleStartGame("necro"));
  startAsCrown?.addEventListener('click', () => handleStartGame("crown"));
}
