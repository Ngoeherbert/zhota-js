import express from "express";

const app = express();

app.use(async (req, res) => {
  res.send("Lemine app running 🚀");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});