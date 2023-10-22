import React, { useEffect, useState } from "react";
import { Input, Modal } from "@mantine/core";

import "./Popup.css";

const Popup = () => {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSite, setDeleteSite] = useState(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "mount" });

    const blockedSites = localStorage.getItem("history_blocked_sites");
    if (blockedSites) {
      setSites(JSON.parse(blockedSites));
    }
  }, []);

  useEffect(() => {
    updateSites();
  }, [sites]);

  const updateSites = () => {
    localStorage.setItem("history_blocked_sites", JSON.stringify(sites));
  };

  return (
    <div className="App">
      <table>
        <tbody>
          {sites.map((site, index) => (
            <tr key={index}>
              <td>{site}</td>
              <td>
                <button
                  onClick={() => {
                    // setSites(sites.filter((s) => s !== site));
                    setDeleteConfirm(true);
                    setDeleteSite(site);
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex" }}>
        <Input
          value={newSite}
          onChange={(evt) => setNewSite(evt.target.value)}
          placeholder="Add a site"
        />{" "}
        <button
          onClick={() => {
            setSites([...sites, newSite]);
            setNewSite("");
          }}
        >
          Add
        </button>
        {/* <div id="delete-confirm" hidden={!deleteConfirm}> */}
        {/* Are you sure you want to delete {deleteSite} */}
        {/* </div> */}
        <Modal opened={deleteConfirm} onClose={setDeleteConfirm} closeOnOutsideClick={false} title="Authentication">
          <p>Are you sure you want to delete {deleteSite}</p>
        </Modal>
      </div>
    </div>
  );
};

export default Popup;
