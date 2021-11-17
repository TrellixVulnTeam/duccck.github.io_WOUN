const express = require("express");
// const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const escape = require("lodash/escape");
const pug = require("pug");
const Database = require("better-sqlite3");
const multer = require("multer");
const svgCaptcha = require("svg-captcha");
const md5 = require("md5");

const port = 8080;
const app = express();
const db = new Database("bbs.db", {"verbose": console.log});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./img/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      req.fileErr = "Only accept image!";
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 1024 * 1024 }
});
const session = {};

app.disable('x-powered-by');
app.set("views", "./templates"); // 使用模板引擎
app.locals.pretty = true; // 美化 html 输出

// let users = [];
// let posts = [];
// let comments = [];

// function readJSON(path) {
//   try {
//     return JSON.parse(fs.readFileSync(path));
//   } catch(err) {
//     return [];
//   }
// }
// function writeJSON(path, data, response) {
//   data = JSON.stringify(data, null, 2);
//   try {
//     fs.accessSync(path);
//     fs.readFileSync(path, data, err => {
//       response.status(500).end("Try again later.");
//     });
//   } catch (err) {
//     fs.createWriteStream(path).write(data);
//   }
// }

// app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser("secret"));

app.use((req, res, next) => {
  // users = readJSON("./users.json");
  // posts = readJSON("./posts.json");
  // comments = readJSON("./comments.json");
  if(req.signedCookies.loginId) {
    req.isLogin = true;
    // req.loginUser = users.find(user => user.username == req.signedCookies.loginUser);
    req.loginUser = db.prepare("SELECT * FROM user WHERE userid = ?").get(req.signedCookies.loginId);
  } else {
    req.isLogin = false;
  }
  if(!req.cookies.sessionId) {
    let sessionId = Math.random().toString(16).slice(2);
    res.cookie("sessionId", sessionId);
    session[sessionId] = {};
    req.session = session[sessionId];
  } else {
    req.session = session[req.cookies.sessionId] || {};
  }
  console.log(req.url);
  next();
});

app.get("/", (req, res, next) => {
  // res.set("Content-Type", "text/html; charset=utf-8");
  // if(posts.length > 0) {
  //   res.write(`
  //     <h1>Talk Square</h1>
  //     ${
  //       req.isLogin ? `
  //         <a href="/post"><button>Compose</button></a>
  //         <a href="/logout"><button>Log out</button></a>
  //       ` : `
  //         <a href="/login"><button>Login</button></a>
  //         <a href="/register"><button>Register</button></a>
  //       `
  //     }
  //     <ul>
  //       ${
  //         posts.map(post => {
  //           return `<li><a href="/post/${post.id}">${post.title}</a> by ${post.auther}</li>`
  //         }).join("\n")
  //       }
  //     </ul>
  //   `);
  // }
  // res.end();
  res.render("home.pug", {
    posts: db.prepare("SELECT * FROM post").all(),
    isLogin: req.isLogin
  });
});

app.route("/login")
  .get((req, res, next) => {
    if(req.isLogin) {
      res.redirect("back");
    } else {
      // fs.createReadStream("./static/login.html").pipe(res);
      res.render("login.pug");
    }
  })
  .post((req, res, next) => {
    // if(users.find(item => item.username == req.body.username && item.password == req.body.password)) {
    //   res.cookie("loginUser", req.body.username, {signed: true});
    //   res.redirect("/");
    // } else {
    //   res.redirect("back");
    // }
    if(req.session.captcha !== req.body.captcha) {
      console.log("CAPTCHA WRONG");
      console.log(req.session.captcha);
      console.log(req.body.captcha);
      res.redirect("back");
      return;
    }
    const stmt = db.prepare(`SELECT * FROM user WHERE username = ? AND password = ?`);
    try {
      req.body.password = md5(req.body.password);
      let result = stmt.get(req.body.username, req.body.password);
      if(result) {
        console.log("SUCCESS");
        res.cookie("loginId", result.userid, {signed: true});
        res.redirect("/");
      } else {
        console.log("FAIL");
        res.redirect("back");
      }
    } catch(err) {
      res.status(500).send("Something wrong on server, please try again later.");
    }
  });

app.route("/register")
  .get((req, res, next) => {
    if(req.isLogin) {
      res.redirect("back");
    } else {
      // fs.createReadStream("./static/register.html").pipe(res);
      res.render("register.pug");
    }
  })
  .post(upload.single("avatar"), (req, res, next) => {
    if(req.fileErr) {
      res.status(501).send(req.fileErr);
    }
    let username = req.body.username;
    let email = req.body.email;
    let regexp = /^\w{3,8}$/;
    if(regexp.test(username)) {
      // if(users.some(item => item.username == username || item.email == email)) {
      //   res.redirect("back");
      // } else {
      //   req.body.id = users.length;
      //   users.push(req.body);
      //   writeJSON("./users.json", users, res);
      //   res.redirect("./login");
      // }
      try {
        const stmtSelect = db.prepare("SELECT username, email FROM user WHERE username = ? OR email = ?");
        let result = stmtSelect.get(username, email);
        if(result) {
          res.redirect("back");
        } else {
          if(!req.file) {
            req.body.avatar = "duccck.jpg";
          } else {
            req.body.avatar = req.file.filename;
          }
          const stmtInsert = db.prepare("INSERT INTO user (username, email, password, avatar) VALUES (@username, @email, @password, @avatar)");
          req.body.password = md5(req.body.password);
          stmtInsert.run(req.body);
          res.redirect("./login");
        }
      } catch(err) {
        res.status(500).send("Something wrong on server, please try again later.");
      }
    } else {
      res.redirect("back");
    }
  });

app.get("/captcha", (req, res, next) => {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  res.type("svg");
  res.end(captcha.data);
});

app.use("/logout", (req, res, next) => {
  res.clearCookie("loginId");
  res.redirect("/");
});

app.route("/compose")
  .get((req, res, next) => {
    if(req.isLogin) {
      // fs.createReadStream("./static/post.html").pipe(res);
      res.render("compose.pug");
    } else {
      res.redirect("back");
    }
  })
  .post((req, res, next) => {
    req.body.title = escape(req.body.title.trim());
    req.body.content = escape(req.body.content.trim());
    req.body.timestamp = new Date().toLocaleString("zh-CN", {hourCycle: "h24"});
    req.body.author = req.loginUser.username;
    // req.body.id = posts.length;
    // posts.push(req.body);
    // writeJSON("./posts.json", posts, res);
    // res.redirect("/post/" + (posts.length - 1));
    try {
      const stmt = db.prepare("INSERT INTO post (title, content, timestamp, username) VALUES (@title, @content, @timestamp, @author)");
      let result = stmt.run(req.body);
      res.redirect("/post/" + result.lastInsertRowid);
    } catch(err) {
      res.status(500).send("Something wrong on server, please try again later.");
    }
  });
  
app.get("/post/:id", (req, res, next) => {
  // let post = posts[req.params.id];
  // let commentsSpec = comments.filter(comment => comment.postId == req.params.id);
  // if(post) {
    // res.set("Content-type", "text/html; charset=utf-8");
    // res.write(`
    //   ${
    //     req.isLogin ? `
    //       <a href="/post"><button>Compose</button></a>
    //       <a href="/logout"><button>Log out</button></a>
    //     ` : `
    //       <a href="/login"><button>Login</button></a>
    //       <a href="/register"><button>Register</button></a>
    //     `
    //   }
    //   <h1>${post.title}</h1>
    //   <span>${post.timestamp}</span>
    //   <p style="border: 1px solid black; padding: 5px;">${post.content}</p>
    //   <hr>
    //   ${
    //     req.isLogin ? `
    //       <form action="/comment/post/${req.params.id}" method="POST">
    //         <h2>Comment</h2>
    //         <input type="text" name="content" value="">
    //         <input type="submit" value="Submit">
    //       </form>
    //     ` : `
    //       <p><a href="/login">Log in</a> or <a href="/register">sign up</a> to leave a comment.</p>
    //     `
    //   }
    // `);
    // for(let i = commentsSpec.length - 1; i >= 0; i--) {
    //   res.write(`
    //     <div>
    //       <p>${commentsSpec[i].username} <i>${commentsSpec[i].timestamp}</i></p>
    //       <p>${commentsSpec[i].content}</p>
    //     </div>
    //     <hr></hr>
    //   `);
    // }
    // res.end();
  //   res.render("post.pug", {
  //     isLogin: req.isLogin,
  //     post: post,
  //     postId: req.params.id,
  //     commentsSpec: commentsSpec
  //   });
  // } else {
  //   res.redirect("back");
  // }
  try {
    let resultPost = db.prepare("SELECT * FROM post WHERE postid = ?").get(req.params.id);
    let resultComment = db.prepare("SELECT * FROM comment WHERE postid = ?").all(req.params.id);
    let resultAvatar = db.prepare("SELECT avatar FROM user WHERE username = ?").get(resultPost.username);
    if(resultPost) {
      res.render("post.pug", {
        isLogin: req.isLogin,
        post: resultPost,
        commentsSpec: resultComment,
        avatar: resultAvatar.avatar,
        loginUser: req.loginUser ? req.loginUser.username : undefined
      });
    } else {
      res.redirect("back");
    }
  } catch(err) {
    res.status(500).send("Something wrong on server, please try again later.");
  }
});

app.use("/img", express.static(__dirname + "/img"));

app.post("/comment/post/:id", (req, res, next) => {
  let comment = req.body;
  comment.content = escape(comment.content.trim());
  comment.timestamp = new Date().toLocaleString("zh-CN", {hourCycle: "h24"});
  comment.username = req.loginUser.username;
  comment.postId = req.params.id;
  // comments.push(comment);
  // writeJSON("./comments.json", comments, res);
  // res.redirect("back");
  try {
    let stmt = db.prepare("INSERT INTO comment (content, timestamp, username, postid) VALUES (@content, @timestamp, @username, @postId)");
    stmt.run(comment);
    res.redirect("back");
  } catch(err) {
    res.status(500).send("Something wrong on server, please try again later.");
  }
});

app.delete("/delete_post", (req, res, next) => {
  try {
    let postid = req.body.postid;
    db.prepare("DELETE FROM post WHERE postid = ?").run(postid);
    db.prepare("DELETE FROM comment WHERE postid = ?").run(postid);
    res.status(200).json({ message: "success" });
  } catch(err) {
    res.status(500).send("Something wrong on server, please try again later.");
  }
});

app.delete("/delete_comment", (req, res, next) => {
  try {
    let commentid = req.body.commentid;
    db.prepare("DELETE FROM comment WHERE commentid = ?").run(commentid);
    res.status(200).json({ message: "success" });
  } catch(err) {
    res.status(500).send("Something wrong on server, please try again later.");
  }
});

app.use("/", (req, res, next) => {
  res.redirect("/");
});

app.listen(port, () => {
  console.log("listening on " + port);
});