const siteOptions = {
  // root: {
  //   label: "Root Domain",
  // },
  subDomain: {
    label: "Subdomain",
    onChange: (changeFunc) => changeFunc(),
  },
  exact: {
    label: "Exact URL",
    onChange: (changeFunc) => changeFunc(),
  },
};

export { siteOptions };
