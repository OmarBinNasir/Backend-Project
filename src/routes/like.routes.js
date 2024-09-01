import { Router } from "express"
import { toggleVideoLike, toggleCommentLike, toggleTweetLike } from "../controllers/like.controller"
import { verifyJWT } from "../middlewares/auth.middleware"

const router = Router()

router.use(verifyJWT)

router.route("/:videoId").post(toggleVideoLike)
router.route("/:commentId").post(toggleCommentLike)

export default router