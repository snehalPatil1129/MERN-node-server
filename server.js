const express = require("express");
const app = express();
const mongoose = require("mongoose");

//db configuration
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db)
  .then(() => console.log("MongoDb connection success"))
  .catch(err => console.log("Error", err));
app.get("/", (req, res) => res.send("Hello Node"));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on ${port}`));
