const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Project, User } = require("../models");
const bcrypt = require("bcrypt");
const saltRounds = 10

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// All Projects
 async function index (req,res) {
  try {
    const projects = await Project.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    res.render("project", { projects, 
      user: req.session.user
     });
  } catch (error) {
    res.status(500).send("Terjadi kesalahan saat mengambil data.");
  }
};

// Form Tambah Project
const create = (req, res) => {
  const user = req.session.user;

  if (user) {res.render("project-create");
  } else {
    res.redirect("/login")
  }
};

const store = async (req, res) => {
  try {
    const { title, startDate, endDate, description, categories, userId } = req.body;

    if (!title || !startDate || !endDate || !description) {
      return res.status(400).send("Semua field wajib diisi kecuali gambar!");
    }

    let formattedCategories = Array.isArray(categories) 
    ? categories 
    : categories ? [categories] : []; 

    let image = req.file ? `/uploads/${req.file.filename}` : "https://picsum.photos/200";

    await Project.create({
      title,
      startDate,
      endDate,
      description,
      categories: formattedCategories,
      image,
      userId: req.session.user.id,
    });

    res.redirect("/project");
  } catch (error) {
    console.error("Error saat menyimpan project:", error);
    res.status(500).send("Terjadi kesalahan saat menyimpan project.");
  }
  console.log("File uploaded:", req.file ? req.file.path : "No file uploaded");
};

// Detail Project
const getDetail = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id } });
    if (!project) return res.status(404).send("Project tidak ditemukan");

    res.render("project-detail", { project });
  } catch (error) {
    res.status(500).send("Terjadi kesalahan.");
  }
};

// Form Edit Project
const edit = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).send("Project tidak ditemukan");

    res.render("project-edit", { project });
  } catch (error) {
    console.error("Error saat mengambil data project:", error);
    res.status(500).send("Terjadi kesalahan.");
  }
};

// Update Project
const update = async (req, res) => {
  try {
    console.log("Data dari form:", req.body);
    console.log("File yang diupload:", req.file);
    const { title, startDate, endDate, description, categories } = req.body;
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).send("Project tidak ditemukan");

    let formattedCategories = categories
      ? Array.isArray(categories)
        ? categories // Jika sudah array, simpan langsung
        : [categories] // Jika bukan array, bungkus dalam array
      : [];

    let image = req.file ? `/uploads/${req.file.filename}` : project.image;

    await project.update({
      title,
      startDate,
      endDate,
      description,
      categories: formattedCategories,
      image,
    });
    console.log("Data yang akan diupdate:", {
      title,
      startDate,
      endDate,
      description,
      categories: formattedCategories, // Cek apakah array atau string
      image,
    });

    res.redirect("/project");
  } catch (error) {
    console.error("Error saat memperbarui project:", error);
    res.status(500).send("Terjadi kesalahan saat memperbarui project.");
  }
};

// Hapus Project
const destroy = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).send("Project tidak ditemukan");

    if (project.image) {
      const imagePath = path.join(__dirname, "../public", project.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await project.destroy();
    res.redirect("/project");
  } catch (error) {
    console.error("Error saat menghapus project:", error);
    res.status(500).send("Terjadi kesalahan saat menghapus project.");
  }
};
// register
async function authRegister(req, res) {
  try {
    console.log("Register request body:", req.body); // Debugging log

    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.render("authRegister", { error: "Semua field wajib diisi!" });
    }

    if (password !== confirmPassword) {
      return res.render("authregister", { error: "Password dan Konfirmasi Password tidak sama!" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    req.flash("success", "Berhasil mendaftar! Silakan login.");
    res.redirect("/login");

  } catch (error) {
    console.error("Error saat registrasi:", error);
    res.status(500).send("Terjadi kesalahan saat registrasi.");
  }
}


async function authLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  console.log("User  found:", user); // Tambahkan log di sini

  if (!user) {
    req.flash("error", "User  tidak ditemukan");
    return res.redirect("/login");
  }

  // Check password
  const isValidated = await bcrypt.compare(password, user.password);

  if (!isValidated) {
    req.flash("error", "Password mismatch");
    return res.redirect("/login");
  }

  let loggedInUser  = user.toJSON();
  delete loggedInUser.password;

  req.session.user = loggedInUser ;
  req.flash("success", `${loggedInUser .name} Berhasil login :)`);
  res.redirect("/home");
}

async function authLogout(req, res) {
  req.session.user = null;
  res.redirect("/login")
}
module.exports = {
  index,
  create,
  store,
  edit,
  update,
  destroy,
  getDetail,
  authRegister,
  authLogin,
  authLogout,
  upload,
};