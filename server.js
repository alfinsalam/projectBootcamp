const express = require("express");
const hbs = require("hbs")
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const flash = require ("express-flash");
const session = require("express-session");
const port = 3000;
const {
  index,
  create,
  store,
  edit,
  update,
  getDetail,
  destroy,
  authRegister,
  authLogin,
  authLogout,
  upload,
} = require("./controllers/projectController");
const { search } = require("./controllers/searchControllers");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));
app.use(session({
  secret: "sjfeafjbkeana",
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerHelper('json', function(context) {return JSON.stringify(context, null, 2);});
hbs.registerPartials(path.join(__dirname, "views", "partials"));
hbs.registerHelper("eq", (a, b) => a === b);
hbs.registerHelper("equal", (a, b) => a === b);
hbs.registerHelper("contains", (array, value) => {
  return Array.isArray(array) && array.includes(value);
});
app.use(session({
  secret: "salkfnejbfwkbf",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// **Routing**
app.get("/", (req, res) => res.redirect("/project"));
app.get("/home", (req, res) => res.render("home", { user: req.session.user }));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/testimonial", (req, res) => res.render("testimonial"));
app.get("/search", search);
app.get("/register", (req, res) => { res.render("authRegister");});
app.post("/register", authRegister);
app.get("/login", (req, res) => { res.render("authLogin");});
app.post("/login", authLogin);
app.get("/logout", authLogout)

// **Project Routes**
app.get("/project", index);
app.get("/project/create", create);
app.post("/project", upload.single("image"), store);
app.get("/project/:id/edit", edit);
app.post("/project/:id/edit", upload.single("image"), update);
app.get("/project-detail/:id", getDetail);
app.post("/project/:id/delete", destroy);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
