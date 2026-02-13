const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    blogId: {
      type: String,
      unique: true,
      required: [true, "Blog ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
    },
    authorBio: {
      type: String,
      required: [true, "Author bio is required"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    facebook: {
      type: String,
      required: [true, "Facebook is required"],
    },
    linkedin: {
      type: String,
      required: [true, "LinkedIn is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
    },
  },
  { timestamps: true },
);

// Auto-generate blogId before saving
BlogSchema.plugin(customIdGenerator, {
  field: "blogId",
  prefix: "BLG",
  enableCondition: (blog) => !!blog.title,
});

// generate slug from title before saving
BlogSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
  }
  next();
});

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;
