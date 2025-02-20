const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const hbs = require("hbs");

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(__dirname + "/views/partials", function (err) {});
hbs.registerHelper("equal", function (a, b) {
  return a === b;
});
app.use("/assets", express.static(path.join(__dirname, "assets")));
console.log("Serving static files from:", path.join(__dirname, "assets"));

const { renderHome } = require("./controllers/homeController");
const { renderProject } = require("./controllers/projectController");
const { renderContact } = require("./controllers/contactController");

app.get("/home", renderHome);
app.get("/contact", renderContact);
app.get("/project", renderProject);

app.get('/project-detail', (req, res) => { res.render('project-detail'); });

app.listen(port, () => {
  console.log(`server berjalan di ${port}`);
});
