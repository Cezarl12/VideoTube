import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller.js";
import { createUpdatePlaylistValidator } from "../validators/playlistValidator.js";
import { validate } from "../middlewares/validator.js";
import { verifyJWT } from "../middlewares/auth.js";
const router = Router();
router.use(verifyJWT);
router
  .route("/")
  .post(createUpdatePlaylistValidator(), validate, createPlaylist);
router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(createUpdatePlaylistValidator(), validate, updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;
