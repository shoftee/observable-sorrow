import { Game, IGamePresenter } from "./game";

const presenter = new Game().init();
presenter.render();

const Presenter: IGamePresenter = presenter;
export default Presenter;
