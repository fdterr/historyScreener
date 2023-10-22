console.log("This is the background page.");

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type === "mount") {
    console.log(
      "Put the background scripts here.",
      await chrome.history.search({ text: "", startTime: 0, maxResults: 0 })
    );
  }
  const history = await chrome.history.search({
    text: "",
    startTime: 0,
    maxResults: 0,
  });
  const matches = history.filter((item) => item.url.includes("espn.com"));
  console.log("matches", matches);
  matches.forEach((match) => chrome.history.deleteUrl({ url: match.url }));
});

(async () => {})();
