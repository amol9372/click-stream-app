import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import history from "./utils/history";
import {
  ChakraBaseProvider,
  extendBaseTheme,
  theme as chakraTheme,
  ChakraProvider,
  extendTheme,
} from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider

const root = createRoot(document.getElementById("root"));
root.render(
  <ChakraProvider resetCSS theme={theme}>
    <App />
  </ChakraProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
