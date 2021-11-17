const express = require("express");

const news = express.Router();
const entertainment = express.Router();

news.get("/sport", (req, res, next) => {
  res.end("sport news");
});
news.get("/tech", (req, res, next) => {
  res.end("tech news");
});

news.use("/entertainment", entertainment);
entertainment.get("/music", (req, res, next) => {
  res.end("music");
});
entertainment.get("/movie", (req, res, next) => {
  res.end("movie");
});

// exports 对象用于导出模块公用方法和属性
// module.exports 用于替换当前模块的导出对象
module.exports = news;