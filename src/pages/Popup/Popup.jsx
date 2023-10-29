import React, { useEffect, useState } from "react";
import { Button, Checkbox, Input, Modal, TextInput } from "@mantine/core";

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
    withCloseButton={false}
  >
    <p>Are you sure you want to delete {deleteSite?.url}</p>{" "}
    <div className="yes-no-confirm">
      <Button
        onClick={() => {
          console.log("delete from list", deleteSite);
          setSites(sites?.filter((s) => s.url !== deleteSite?.url));
          setDeleteConfirm(false);
          setDeleteSite(null);
        }}
      >
        Yes
      </Button>
      <Button
        variant="filled"
        color="red"
        onClick={() => {
          setDeleteConfirm(false);
          setDeleteSite(null);
        }}
      >
        No
      </Button>
    </div>
  </Modal>
);

const Popup = () => {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSite, setDeleteSite] = useState(null);
  const [inputError, setInputError] = useState(false);

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
    updateSitesInLocalStorage();
  }, [sites]);

  const updateSitesInLocalStorage = () => {
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
        <TextInput
          value={newSite}
          onChange={(evt) => {
            setInputError(false);
            setNewSite(evt.target.value)
          }}
          label="Add a new site"
          placeholder="http://google.com"
          error={inputError}
        />{" "}
        <button
          onClick={() => {
            // Check for empty string
            if (!newSite) {
              setInputError("Please enter a site to block");
              return;
            }

            // Check for duplicate site
            if (sites?.find((site) => site.url === newSite)) {
              setInputError("Site already exists");
              return;
            }
            
            // Check for a valid URL - can be with or without http(s) or www
            const urlRegex = /^(https?:\/\/)?(www\.)?([a-z0-9]+(-?[a-z0-9]+)*\.)+[a-z]{2,}$/i;
            if (!urlRegex.test(newSite)) {
              setInputError("Please enter a valid URL");
              return;
            }

            const newSiteObj = { url: newSite, root: true, exact: false };
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
