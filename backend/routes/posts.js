const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/postController");

router.get("/", controller.listPosts);
router.post("/", auth, controller.createPost);
router.get("/:id", controller.getPost);
router.put("/:id", auth, controller.updatePost);
router.delete("/:id", auth, controller.deletePost);
router.post("/:id/like", auth, controller.toggleLike);

module.exports = router;
