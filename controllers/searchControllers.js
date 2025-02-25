const fs = require("fs");
const path = require("path");

// Fungsi untuk mencari teks dalam file .hbs dan .html
const searchFiles = (query, directory) => {
    let results = [];

    if (!fs.existsSync(directory)) return results;

    // Baca semua file di dalam folder
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        
        // Cek apakah file berformat .hbs atau .html atau.js
        if (fs.statSync(filePath).isFile() && (file.endsWith(".hbs") || file.endsWith(".html") || file.endsWith(".js"))) {
            const content = fs.readFileSync(filePath, "utf8");

            if (content.toLowerCase().includes(query.toLowerCase())) {
                // menghapus ekstensi sebelum menambahkan ke hasil pencarian
                results.push(file.replace(/\.(hbs|html)$/, ""));
            }
        }
    });

    return results;
};

// Route untuk fitur pencarian
const search = (req, res) => {
    const { query } = req.query;
    console.log(" Query Pencarian:", query);

    if (!query) {
        return res.redirect("/");
    }

    const viewsPath = path.join(__dirname, "../views");
    const bootcampPath = path.join(__dirname, "../tugas-bootcamp");

    let searchResults = [
        ...searchFiles(query, viewsPath),
        ...searchFiles(query, bootcampPath)
    ];

    console.log(" Hasil Pencarian (tanpa ekstensi):", searchResults);

    res.render("search-results", { query, searchResults });
};

module.exports = { search };
