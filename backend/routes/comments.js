const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/commentController");

router.get("/posts/:id/comments", controller.listComments);
router.post("/posts/:id/comments", auth, controller.createComment);
router.delete("/comments/:id", auth, controller.deleteComment);

module.exports = router;
