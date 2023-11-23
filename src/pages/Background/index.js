console.log("This is the background page.");

let sites = [];

// Returns true if any site's url matches the root domain of the provided url
// e.g. if the site is "google.com" and the history item is "mail.google.com"
// then this will return true
function subDomainMatch(url) {
  const domain = stripPathAndProtocol(url);
  for (const site of sites) {
    // only if it is checked
    if (site.subDomain) {
      if (domain.indexOf(site.url) !== -1) {
        return true;
      }
    }
  }

  return false;
}

// Return true if any site's url is a root domain match to the provided url
// e.g. if the site is "google.com" and the history item is "google.com/search"
// then this will return true
function rootDomainMatch(url) {
  const domain = stripPathAndProtocol(url);
  for (const site of sites) {
    if (site.root) {
      if (domain === site.url) {
        return true;
      }
    }
  }
  return false;
}

// Return true if any site's url is an exact match to the provided url including path and query
// e.g. if the site is "google.com/search" and the history item is "google.com/search?q=hello"
// then this will return false
function exactDomainMatch(url) {
  const match = sites.find((site) => site.url === url);
  if (match && match.exact) {
    return true;
  }
  return false;
}

// When a new site is visited, check if it is in the list of blocked sites
// and delete if so
chrome.history.onVisited.addListener(async function (historyItem) {
  const domain = stripPathAndProtocol(historyItem.url);
  const rD = rootDomain(historyItem.url);
  const parsedFull = parseSite(historyItem.url);
  console.log("Root Domain:", rD);
  console.log("Full Domain (incl Sub)", domain);
  console.log("Parsed Full", parsedFull);

  if (subDomainMatch(domain)) {
    await deleteSingleHistoryEntry(historyItem.url);
  } else if (rootDomainMatch(historyItem.url)) {
    await deleteSingleHistoryEntry(historyItem.url);
  } else if (exactDomainMatch(parsedFull)) {
    await deleteSingleHistoryEntry(historyItem.url);
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
    console.log("received newSite", request.site.url);
    const parsedSite = parseSite(request.site.url);
    sites.push({ ...request.site, url: parsedSite });
    await writeSitesToStorage();
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

  if (request.type === "purge_site") {
    console.log("purging site", request.site);
    try {
      await purgeUrl(request.site.url);
    } catch (e) {
      console.log("e", e);
    }
  }
});

// Parses a usable site from user input by removing any
// preceeding http://, http://, and www. from the url
// and any trailing slash
function parseSite(site) {
  const parsedSite = site
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "")
    .replace(/\/$/, "");

  return parsedSite;
}

// Completely deletes a site from history
// Deletes every history item whose url contains the site
async function deleteSingleHistoryEntry(site) {
  console.log("deleting", site);
  try {
    await chrome.history.deleteUrl({ url: site });
  } catch (e) {
    console.log("e", e);
  }
}

async function purgeUrl(url) {
  const history = await chrome.history.search({
    text: "",
    startTime: 0,
    maxResults: 0,
  });
  const matches = history.filter((item) => item.url.includes(url));
  matches.forEach((match) => {
    console.log("match", match);
    chrome.history.deleteUrl({ url: match.url });
  });
}

// Strips any path or query from the url
function stripPathAndProtocol(url) {
  const parsedSite = parseSite(url); // removes http://, https://, and www.
  const domainOnly = parsedSite.split("/")[0]; // removes any path or query

  return domainOnly;
}

// Strips any subdomain from the url
function rootDomain(url) {
  const domainOnly = stripPathAndProtocol(url);
  const domainParts = domainOnly.split(".");
  const rootDomain = domainParts.slice(-2).join(".");

  return rootDomain;
}

// Write a list of sites to locaStorage
async function writeSitesToStorage() {
  await chrome.storage.local.set({ history_blocked_sites: sites });
}

(async () => {
  // In case the user does not open the popup window after restarting chrome
  // we must retrieve our list of blocked sites from background localStorage
  sites = (await chrome.storage.local.get("history_blocked_sites"))
    .history_blocked_sites;
  console.log("sites", sites);
})();
