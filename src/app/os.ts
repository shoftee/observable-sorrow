import { Game } from "./game/game";
import { IUiGame } from "./ui/game";

const Instance: IUiGame = new Game().init();
export default Instance;
