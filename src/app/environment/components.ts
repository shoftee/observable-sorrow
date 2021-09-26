import { Component } from "@/app/ecs";
import { SeasonId, WeatherId } from "../core/metadata";

export class EnvironmentComponent extends Component {
  year = 0;
  season: SeasonId = "spring";
  day = 0;
  weatherId: WeatherId = "neutral";
}
