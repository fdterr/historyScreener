import React, { useEffect, useState } from "react";
import logo from "../../assets/img/logo.svg";
import Greetings from "../../containers/Greetings/Greetings";
import "./Popup.css";

const Popup = () => {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSite, setDeleteSite] = useState(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "mount" }, () => {
      console.log("popupMounted message sent!");
    });

    const blockedSites = localStorage.getItem("history_blocked_sites");
    if (blockedSites) {
      setSites(JSON.parse(blockedSites));
    }
  }, []);

  useEffect(() => {
    updateSites();
  }, [sites]);

  const updateSites = () => {
    console.log("updating sites", sites, localStorage);
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
        <input
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
        <div hidden={!deleteConfirm}>Are you sure you want to delete {deleteSite}</div>
      </div>
    </div>
  );
};

export default Popup;
