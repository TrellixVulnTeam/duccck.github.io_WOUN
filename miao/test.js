const fs = require("fs");

try {
  var data = fs.readFileSync("./user.json")
  console.log(data);
} catch (err) {
  console.log("fjsidf");
}