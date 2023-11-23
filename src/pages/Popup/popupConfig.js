const siteOptions = {
  exact: {
    label: "Exact URL",
    onChange: (changeFunc) => changeFunc(),
    tooltip: "Deletes URLs that exactly match the URL you provided.",
  },
  root: {
    label: "Root Domain",
    tooltip: "Deletes URLs that match the root domain of the URL you provided.",
  },
  subDomain: {
    label: "Subdomains",
    tooltip:
      "Deletes URLs that match the root domain of the URL you provided AND also have a subdomain.",
    onChange: (changeFunc) => changeFunc(),
  },
};

export { siteOptions };
