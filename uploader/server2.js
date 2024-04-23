const express = require("express");
const multer = require("multer");
const { PassThrough } = require("stream");
const fs = require("fs");
const app = express();
const port = 3000;

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this uploads directory exists
  },
  filename: function (req, file, cb) {
    cb(null, +Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.static("public")); // Serve your static HTML file

// Single file upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    console.log("File uploaded successfully:", req.file);
    res.send({ message: "File uploaded successfully", file: req.file });
  } else {
    res.status(400).send({ message: "File upload failed" });
  }
});

function fileStreamHandler(req, res, next) {
  const pass = new PassThrough();
  req.pipe(pass);

  let writeStream = fs.createWriteStream(`./uploads/${Date.now()}.dat`);

  pass.on("data", (chunk) => {
    writeStream.write(chunk);
  });

  pass.on("end", () => {
    writeStream.end();
    console.log("File streamed to disk successfully");
    res.send({ message: "File uploaded and streamed successfully" });
  });

  pass.on("error", (err) => {
    console.error("Error while streaming file:", err);
    res.status(500).send({ message: "Error while streaming the file" });
  });
}

app.post("/uploadBig", fileStreamHandler);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
