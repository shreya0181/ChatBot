const express = require("express");
const router = express.Router();

//  get request to th eroute route

router.get("/", (req, res) => {
  res.send("server is up and running");
});

module.exports = router;
