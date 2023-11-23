import React from "react";
import { Tabs } from "@mantine/core";

import URLs from "./URLs";

import "./Popup.css";

const Popup = () => {
  return (
    <div className="App">
      <Tabs defaultValue="urls">
        <Tabs.List grow>
          <Tabs.Tab value="urls">URLs</Tabs.Tab>
          <Tabs.Tab value="keywords">Keywords</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="urls">
          <URLs />
        </Tabs.Panel>
        <Tabs.Panel value="keywords">
          <div>Keywords here</div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default Popup;
