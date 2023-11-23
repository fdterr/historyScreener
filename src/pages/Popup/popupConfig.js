const siteOptions = {
  exact: {
    label: "Exact URL",
    onChange: (changeFunc) => changeFunc(),
  },
  root: {
    label: "Root Domain",
  },
  subDomain: {
    label: "Subdomains",
    onChange: (changeFunc) => changeFunc(),
  },
};

export { siteOptions };
