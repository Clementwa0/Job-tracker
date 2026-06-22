exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({
    success: true,
    data: {
      url,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    },
  });
};
