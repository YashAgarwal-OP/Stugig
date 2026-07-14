const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// --- Profile photo storage ---
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/profiles');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${req.user.id}_${Date.now()}${ext}`);
  }
});

// --- Portfolio image storage ---
const portfolioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/portfolio');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `portfolio_${req.user.id}_${Date.now()}${ext}`);
  }
});

// --- Service image storage ---
const serviceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/services');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `service_${req.user.id}_${Date.now()}${ext}`);
  }
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

exports.uploadProfilePhoto = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE }
}).single('profilePhoto');

exports.uploadPortfolioImage = multer({
  storage: portfolioStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE }
}).single('image');

exports.uploadServiceImage = multer({
  storage: serviceStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE }
}).single('image');
