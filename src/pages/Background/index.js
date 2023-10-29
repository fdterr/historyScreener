console.log("This is the background page.");

let sites = [];

// When a new site is visited, check if it is in the list of blocked sites
// and delete if so
chrome.history.onVisited.addListener(async function (historyItem) {
  const parsedSite = parseSite(historyItem.url);
  const domainOnly = parsedSite.split("/")[0];
  if (sites.map((site) => site.url).includes(domainOnly)) {
    console.log("blocking", domainOnly);
    chrome.history.deleteUrl({ url: historyItem.url });
  }
});

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type === "new_site") {
    // On receiving a new site, parse the url, add it to the list of sites,
    // and delete it from history
    console.log("received newSite");
    const parsedSite = parseSite(request.site.url);
    sites.push({ ...request.site, url: parsedSite });
    await writeSitesToStorage();
    await deleteSiteFromHistory(parsedSite.url);
  }

  if (request.type === "blocked_sites") {
    // When user opens the popup, receive the new list of blocked sites
    // and set sites locally
    const newSites = request.sites.map((site) => {
      const parsedSite = parseSite(site.url);
      return { ...site, url: parsedSite };
    });

    sites = newSites;
    await writeSitesToStorage();
    console.log("received full sites list - parsed:", sites);
  }
});

// Parses a usable site from user input by removing any
// preceeding http://, http://, and www. from the url
function parseSite(site) {
  console.log("parsing", site);
  const parsedSite = site
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "");
  return parsedSite;
}

// Completely deletes a site from history
// Deletes every history item whose url contains the site
async function deleteSiteFromHistory(site) {
  console.log("deleting", site);
  const history = await chrome.history.search({
    text: "",
    startTime: 0,
    maxResults: 0,
  });
  const matches = history.filter((item) => item.url.includes(site));
  matches.forEach((match) => chrome.history.deleteUrl({ url: match.url }));
}

// Write a list of sites to locaStorage
async function writeSitesToStorage() {
  await chrome.storage.local.set({ history_blocked_sites: sites });
}

(async () => {
  // In case the user does not open the popup window after restarting chrome
  // we must retrieve our list of blocked sites from localStorage
  sites = await chrome.storage.local.get("history_blocked_sites");
})();
