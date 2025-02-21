require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Schema untuk menyimpan informasi file
const FileSchema = new mongoose.Schema({
  filename: String,
  filepath: String,
  mimetype: String,
  size: Number,
});
const File = mongoose.model("File", FileSchema);

// Konfigurasi Multer (Folder penyimpanan)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Route Upload File
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = new File({
      filename: req.file.filename,
      filepath: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
    await file.save();
    res.json({ message: "File uploaded successfully", file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route Get Files
app.get("/files", async (req, res) => {
  const files = await File.find();
  res.json(files);
});

// Route untuk akses file statis
app.use("/uploads", express.static("uploads"));

// Menjalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));