console.log("This is the background page.");

let sites = [];

chrome.history.onVisited.addListener(async function (historyItem) {
  const parsedSite = parseSite(historyItem.url);
  const domainOnly = parsedSite.split("/")[0];
  if (sites.includes(domainOnly)) {
    console.log("blocking", domainOnly);
    await deleteSiteFromHistory(domainOnly);
  }
});

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type === "new_site") {
    console.log("received newSite");
    const parsedSite = parseSite(request.site);
    sites.push(parsedSite);
    await deleteSiteFromHistory(parsedSite);
  }

  if (request.type === "blocked_sites") {
    sites = request.sites.map(parseSite);
    console.log("received full sites list - parsed:", sites);
  }
});

// Parses a usable site from user input by removing any
// preceeding http://, http://, and www. from the url
function parseSite(site) {
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

(async () => {})();
