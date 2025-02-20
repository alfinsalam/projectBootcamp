const renderHome = (req, res) => {
  res.render("home", { title: "Home Page" });
};

module.exports = { renderHome };
