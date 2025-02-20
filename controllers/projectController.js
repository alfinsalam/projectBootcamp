const renderProject = (req, res) => {
  res.render("project", { title: "My Project" });
};

module.exports = { renderProject };
