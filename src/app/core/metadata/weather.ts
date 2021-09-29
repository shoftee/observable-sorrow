import { WeatherId } from "../../../_interfaces/id";

export type WeatherMetadataType = {
  id: WeatherId;
  adjustment: number;
  label?: string;
};

export const WeatherMetadata: Record<WeatherId, WeatherMetadataType> = {
  neutral: {
    id: "neutral",
    adjustment: 0,
  },
  warm: {
    id: "warm",
    adjustment: +0.15,
    label: "environment.weather.warm",
  },
  cold: {
    id: "cold",
    adjustment: -0.15,
    label: "environment.weather.cold",
  },
};
