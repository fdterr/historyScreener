import React from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import flagsmith from "flagsmith";
import { FlagsmithProvider } from "flagsmith/react";


import Popup from "./Popup";

import "./index.css";
import "@mantine/core/styles.css";

const theme = createTheme({
  /** Put your mantine theme override here */
});

const container = document.getElementById("app-container");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <FlagsmithProvider
    options={{ environmentID: "ctFqZJiHwnwoYCKucYjWN4" }}
    flagsmith={flagsmith}
  >
    <MantineProvider theme={theme}>
      <Popup />{" "}
    </MantineProvider>
  </FlagsmithProvider>
);
