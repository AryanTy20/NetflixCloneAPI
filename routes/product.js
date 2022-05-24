import { Router } from "express";
const router = Router();

import { ProductController } from "../controller/product";
import auth from "../middleware/AuthHandler";

router.get("/", (req, res) => res.json({ msg: "Netflix-Backend API" }));
router.get("/notification", ProductController.notification);
router.get("/movie/:page", ProductController.movie);
router.get("/series/:page", ProductController.series);
router.get("/watch/:id/:title", auth, ProductController.watch);
router.get("/random", auth, ProductController.random);
router.get("/trending", auth, ProductController.trending);
router.get("/netflixoriginals", auth, ProductController.netflixoriginals);
router.get("/tvdiscover", auth, ProductController.discoverT);
router.get("/tvtoprated", auth, ProductController.topratedT);
router.get("/moviediscover", auth, ProductController.discoverM);
router.get("/actionmovie", auth, ProductController.actioM);
router.get("/comedymovie", auth, ProductController.comedyM);
router.get("/horrormovie", auth, ProductController.horrerM);
router.get("/romancemovie", auth, ProductController.romanceM);
router.get("/documentory", auth, ProductController.documentoryM);
router.get("/mylist", auth, ProductController.getlist);
// router.get("/deletelist/:id", auth, ProductController.deletelist);
router.get("/search", ProductController.search);
router.post("/addlist", auth, ProductController.listControll);

export default router;
