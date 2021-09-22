import { Component } from "@/app/ecs";
import { WeatherId } from "../core/metadata";
import { SeasonId } from "../core/metadata/environment";

export class EnvironmentComponent extends Component {
  year = 0;
  season: SeasonId = "spring";
  day = 0;
  weatherId: WeatherId = "neutral";
  weatherModifier = 0;
}
