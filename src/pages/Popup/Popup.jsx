import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Checkbox } from "@mantine/core";

import "./Popup.css";

import { siteOptions } from "./popupConfig";

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
    <p>Are you sure you want to delete {deleteSite?.url}</p>{" "}
    <Button
      onClick={() => {
        console.log("deleting", deleteSite);
        console.log("sites", sites);
        console.log(
          "newSites is",
          sites.filter((s) => s.url !== deleteSite?.url)
        );
        setSites(sites?.filter((s) => s.url !== deleteSite?.url));
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
      console.log('sites from storage', JSON.parse(blockedSites));
      setSites(JSON.parse(blockedSites));

      chrome.runtime.sendMessage({
        type: "blocked_sites",
        sites: JSON.parse(blockedSites),
      });
    }
  }, []);

  useEffect(() => {
    console.log("sites updated");
    updateSites();
    console.log('sites in storage is now', localStorage.getItem(BLOCKED_SITES_KEY))
  }, [sites]);

  const updateSites = () => {
    console.log("updating", sites);
    localStorage.setItem(BLOCKED_SITES_KEY, JSON.stringify(sites));
  };

  // Find a given site in the blocked sites array, and add the provided key/value pair
  const updateSite = (site, key, value) => {
    const newSites = [...sites];

    const siteIndex = newSites.findIndex((s) => s.url === site.url);

    if (siteIndex > -1) {
      newSites[siteIndex][key] = value;
      setSites(newSites);
    }
  };

  return (
    <div className="App">
      {sites?.map((site, index) => (
        <div className="site-row">
          <span>{site.url}</span>
          <Checkbox
            checked={site.root}
            label={siteOptions.root.label}
            onChange={(evt) => {
              updateSite(site, "root", evt.currentTarget.checked);
            }}
          />
          <Checkbox
            checked={site.exact}
            label={siteOptions.exact.label}
            onChange={(evt) =>
              updateSite(site, "exact", evt.currentTarget.checked)
            }
          />
          <button
            onClick={() => {
              setDeleteConfirm(true);
              setDeleteSite(site);
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <div style={{ display: "flex" }}>
        <Input
          value={newSite}
          onChange={(evt) => setNewSite(evt.target.value)}
          placeholder="Add a site"
        />{" "}
        <button
          onClick={() => {
            const newSiteObj = { url: newSite, root: true, exact: true };
            setSites([...sites, newSiteObj]);
            setNewSite("");

            chrome.runtime.sendMessage({
              type: "new_site",
              site: newSiteObj,
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
