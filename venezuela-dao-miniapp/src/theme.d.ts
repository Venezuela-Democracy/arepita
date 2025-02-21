import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    // Definir las variables del tema de Telegram
    "--tg-theme-bg-color": string;
    "--tg-theme-text-color": string;
    "--tg-theme-hint-color": string;
    "--tg-theme-link-color": string;
    "--tg-theme-button-color": string;
    "--tg-theme-button-text-color": string;
    "--tg-theme-secondary-bg-color": string;
  }
} 