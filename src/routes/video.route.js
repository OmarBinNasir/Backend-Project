import { Router } from "express"
import { publishAVideo } from "../controllers/video.controller"

import { upload } from "../middlewares/multer.middleware"
import { verifyJWT } from "../middlewares/auth.middleware"

const router = Router()

router.use(verifyJWT)

router.route("/publish-video").post(
    upload.fields([
        {
            name : "videoFile",
            maxCount : 1
        },
        {
            name : "thumbnail",
            maxCount : 1
        }
    ]),
    publishAVideo
)

export default router