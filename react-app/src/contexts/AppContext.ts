import React, { Dispatch } from "react";
import { AppCredentials } from "../components/Settings";

export const initialState: AppContextInterface = {
  forecast: null,
  news: [],
  location: {},
  footerInfo: {},
  showSettings: false,
};

export const AppContext = React.createContext<{ context: AppContextInterface, dispatch: Dispatch<AppContextActionInterface> }>({ context: initialState, dispatch: () => null });

export const reducer = (context: AppContextInterface, action: AppContextActionInterface): AppContextInterface => {
  switch (action.type) {
    case "NEWS":
      return {
        ...context,
        news: action.news || context.news,
      };

    case "FOOTER_INFO":
      return {
        ...context,
        footerInfo: action.footerInfo || context.footerInfo,
      };
    case "LOCATION":
      return {
        ...context,
        location: action.location || context.location,
      };
    case "SETTING":
      return {
        ...context,
        showSettings: action.showSettings || context.showSettings,
      };
    case "FORECAST":
      return {
        ...context,
        forecast: action.forecast || context.forecast,
      };
    default:
      return context;
  }
};

export const setForecast = (dispatch: Dispatch<AppContextActionInterface>, forecast: CurrentWeather) => {
  console.log("setForecast", forecast);
  dispatch({ type: "FORECAST", forecast });
};

export const setNews = (dispatch: Dispatch<AppContextActionInterface>, news: NewsArticle[]) => {
  console.log("setNews", news);
  dispatch({ type: "NEWS", news });
};

export const setFooterInfo = (dispatch: Dispatch<AppContextActionInterface>, footerInfo: DataMap) => {
  console.log("setFooterInfo", footerInfo);
  dispatch({ type: "FOOTER_INFO", footerInfo });
};

export const setLocation = (dispatch: Dispatch<AppContextActionInterface>, location: DataMap) => {
  console.log("setLocation", location);
  dispatch({ type: "LOCATION", location });
};

export const showSettingsPage = (dispatch: Dispatch<AppContextActionInterface>, data: AppCredentials | null = null) => {
  if (data) {
    window.api.send("toMain_Settings", data);
    dispatch({ type: "SETTING" });
  }
}

export interface AppContextInterface {
  forecast: CurrentWeather | null;
  news: NewsArticle[];
  location: DataMap;
  footerInfo: DataMap;
  showSettings: boolean;
}

export type DataMap = {
  [key: string]: string;
};

export type NewsArticle = {
  title: string;
};

export interface AppContextActionInterface {
  type: string;
  forecast?: CurrentWeather | null;
  news?: NewsArticle[];
  location?: DataMap;
  footerInfo?: DataMap;
  showSettings?: boolean;
}
export type CurrentWeather = {
  weather: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
  }
  wind: string;
  sunrise: string;
  sunset: string;
};