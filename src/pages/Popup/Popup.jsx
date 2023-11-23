import React, { useEffect, useState } from "react";
import { Button, Checkbox, Modal, TextInput, Text } from "@mantine/core";

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
    size="sm"
    opened={deleteConfirm}
    onClose={setDeleteConfirm}
    closeOnClickOutside={false}
    withCloseButton={false}
  >
    <span>Are you sure you want to delete {deleteSite?.url}</span>{" "}
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
    loadSitesFromLocalStorage();
    sendSitesToBackground();
  }, []);

  // When sites are updated, send them to background page and update local storage
  useEffect(() => {
    updateSitesInLocalStorage();
    sendSitesToBackground();
  }, [sites]);

  const sendSitesToBackground = () => {
    const blockedSites = localStorage.getItem(BLOCKED_SITES_KEY);

    if (blockedSites) {
      chrome.runtime.sendMessage({
        type: "blocked_sites",
        sites: JSON.parse(blockedSites),
      });
    }
  };

  const loadSitesFromLocalStorage = () => {
    const blockedSites = localStorage.getItem(BLOCKED_SITES_KEY);

    if (blockedSites) {
      setSites(JSON.parse(blockedSites));
    }
  };

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

  // Send a message to the background page to purge the history for a given site
  const purgeSite = (site) => {
    chrome.runtime.sendMessage({
      type: "purge_site",
      site,
    });
  };

  return (
    <div className="App">
      <div className="sites">
        {sites?.map((site, index) => (
          <div className="site-row" key={index}>
            <Text style={{ width: "20%" }} truncate="end" size="md">
              {site.url}
            </Text>
            {Object.entries(siteOptions).map(([key, option]) => {
              return (
                <Checkbox
                  key={key}
                  checked={site[key]}
                  label={option.label}
                  onChange={(evt) => {
                    updateSite(site, key, evt.currentTarget.checked);
                  }}
                />
              );
            })}
            <Button size="xs" onClick={() => purgeSite(site)}>
              Purge
            </Button>
            <Button
              size="xs"
              onClick={() => {
                setDeleteConfirm(true);
                setDeleteSite(site);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div
        className="add-new-site"
        style={{ display: "flex", alignItems: "end", gap: "10px" }}
      >
        <TextInput
          value={newSite}
          onChange={(evt) => {
            setInputError(false);
            setNewSite(evt.target.value);
          }}
          label="Add a new site"
          placeholder="http://google.com"
          error={inputError}
        />{" "}
        <Button
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
            // as well as any search or query params. Should only allow valid tlds
            const urlRegex =
              /^(?:https?:\/\/)?(?:www\.)?[\w.-]+\.[a-z]{2,}(?:\/.*)?$/;
            const validUrl = urlRegex.test(newSite);

            if (!validUrl) {
              setInputError("Please enter a valid URL");
              return;
            }

            const newSiteObj = {
              url: newSite,
              root: false,
              exact: true,
              subdomain: false,
            };
            setSites([...sites, newSiteObj]);
            setNewSite("");

            chrome.runtime.sendMessage({
              type: "new_site",
              site: newSiteObj,
            });
          }}
        >
          Add
        </Button>
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
