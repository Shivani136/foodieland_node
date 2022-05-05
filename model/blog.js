const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserDetails' },
  categoryId: { type: Schema.Types.ObjectId, ref: 'category' },
  title: { type: String, required: [true, "please Insert title"] },
  subTitle: { type: String, required: [true, "please Insert subTitle"] },
  description: { type: String, required: [true, "please Insert description"] },
  image: { type: String, required: [true, "please upload Image"] },
  video: { type: String, required: [true, "please upload video"] },
  status: { type: String, default: "pending" },
  isDeleted: { type: Boolean, default: 0 },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'UserDetails' },
  blogFAQ: [{
    faqTitle: { type: String },
    faqDescription: { type: String },
    faqImage: { type: String }
  }]
},
  {
    timestamps: true
  });
var Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;
