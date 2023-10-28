import React, { useEffect, useState } from "react";
import { Button, Input, Modal } from "@mantine/core";

import "./Popup.css";

const BLOCKED_SITES_KEY = "history_blocked_sites";

const ConfirmModal = ({
  deleteConfirm,
  setDeleteConfirm,
  setDeleteSite,
  setSites,
  deleteSite,
  sites,
}) => (
  <Modal
    opened={deleteConfirm}
    onClose={setDeleteConfirm}
    closeOnClickOutside={false}
    title="Authentication"
  >
    <p>Are you sure you want to delete {deleteSite}</p>{" "}
    <Button
      onClick={() => {
        console.log("deleting", deleteSite);
        console.log("sites", sites);
        console.log(
          "newSites is",
          sites.filter((s) => s !== deleteSite)
        );
        setSites(sites?.filter((s) => s !== deleteSite));
        setDeleteConfirm(false);
        setDeleteSite(null);
      }}
    >
      Yes
    </Button>
  </Modal>
);

const Popup = () => {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSite, setDeleteSite] = useState(null);

  // On mount (Popup opened), get blocked sites from local storage
  // If we have blocked sites, set them in state and send to background page
  useEffect(() => {
    const blockedSites = localStorage.getItem(BLOCKED_SITES_KEY);

    if (blockedSites) {
      setSites(JSON.parse(blockedSites));

      chrome.runtime.sendMessage({
        type: "blocked_sites",
        sites: JSON.parse(blockedSites),
      });
    }
  }, []);

  useEffect(() => {
    updateSites();
  }, [sites]);

  const updateSites = () => {
    localStorage.setItem(BLOCKED_SITES_KEY, JSON.stringify(sites));
  };

  return (
    <div className="App">
      <table>
        <tbody>
          {sites?.map((site, index) => (
            <tr key={index}>
              <td>{site}</td>
              <td>
                <button
                  onClick={() => {
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

            chrome.runtime.sendMessage({
              type: "new_site",
              site: newSite,
            });
          }}
        >
          Add
        </button>
        <ConfirmModal
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          deleteSite={deleteSite}
          setSites={setSites}
          setDeleteSite={setDeleteSite}
          sites={sites}
        />
      </div>
    </div>
  );
};

export default Popup;
