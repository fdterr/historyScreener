console.log("This is the background page.");

let sites = [];

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  const sites = request.sites;
  console.log("sites", sites.length);
  if (!!sites.length) {
    sites.forEach(async (site) => {
      const parsedSite = parseSite(site);
      console.log("parsedSite", parsedSite);
      await deleteSiteFromHistory(parsedSite);
    });
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
  console.log("matches", matches);
  matches.forEach((match) => chrome.history.deleteUrl({ url: match.url }));
}

setInterval(() => {
  console.log("time", new Date());
}, 5000);

(async () => {})();
