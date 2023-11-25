import React from "react";
import { Tabs } from "@mantine/core";
import { useFlags } from "flagsmith/react";

import URLs from "./URLs";

import "./Popup.css";

const Popup = () => {
  const tabsFlag = useFlags("history_sweeper_tabs");
  if (tabsFlag.history_sweeper_tabs.enabled) {
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
  } else {
    return (
      <div className="App">
        <URLs />
      </div>
    );
  }
};

export default Popup;
