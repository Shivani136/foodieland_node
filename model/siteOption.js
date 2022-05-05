const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const siteOptionSchema = mongoose.Schema({
  logo: { type: String, required: [true, "please upload logo"] },
  title: { type: String, required: [true, "please Insert title"] },
  subTitle: { type: String, required: [true, "please Insert subTitle"] },
  copyRightText: { type: String, required: [true, "please Insert copyrightText"] }
});
var SiteOption = mongoose.model("sitOptions", siteOptionSchema);
module.exports = SiteOption;
