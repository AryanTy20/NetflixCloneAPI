import axios from "./axios";
import { Request } from "./request";
import { API_KEY } from "../../config";
import Wishlist from "../../models/Wishlist";
import CustomError from "../../service/CustomError";
import { wishListValidate } from "../../validation/productValidate";

export const ProductController = {
  async notification(req, res, next) {
    const url = Math.random() > 0.5 ? "tv/airing_today" : "movie/upcoming";
    try {
      const { data } = await axios(
        `${url}?api_key=${API_KEY}&language=en-US&page=1`
      );
      res.json({ ...data });
    } catch (error) {
      console.log(error);
    }
  },
  async movie(req, res, next) {
    try {
      const { page } = req.params;
      const { data } = await axios(`${Request.MTopRated}&page=${page}`);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async series(req, res, next) {
    try {
      const { page } = req.params;
      const { data } = await axios(`${Request.TTopRated}&page=${page}`);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async random(req, res, next) {
    // const page = Math.ceil(Math.random() * (72 - 0) + 0);
    const index = Math.floor(Math.random() * (20 - 0) + 0);
    try {
      let movieData;
      const { data } = await axios(`${Request.NetflixOriginals}`);
      let { id, title, name } = data.results[index];
      title = title || name;
      const checkUrl = async (url) => {
        try {
          await axios.head(url);
          const res = await axios(url);
          if (res.data.title == title) {
            movieData = res.data;
            return true;
          } else {
            throw new error("must be a tv url");
          }
        } catch (error) {
          return false;
        }
      };
      const movieUrl = await checkUrl(
        `movie/${id}?api_key=${API_KEY}&language=en-US`
      );
      if (movieUrl) {
        res.json({ ...movieData });
      } else {
        try {
          const { data } = await axios(
            `tv/${id}?api_key=${API_KEY}&language=en-US`
          );
          res.json({ ...data });
        } catch (err) {
          console.log(err);
        }
      }
    } catch (error) {
      return next(error);
    }
  },

  async watch(req, res, next) {
    let { id, title } = req.params;
    title = title.replace(/[^a-zA-Z0-9]/g, "");
    let movieData, tvData;
    const checkUrl = async (url) => {
      try {
        await axios.head(url);
        const res = await axios(url);
        if (
          res.data.title.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() == title
        ) {
          movieData = res.data;
          return true;
        } else {
          throw new error("must be a tv url");
        }
      } catch (error) {
        return false;
      }
    };
    const movieUrl = await checkUrl(
      `movie/${id}?api_key=${API_KEY}&language=en-US&video=true`
    );

    if (movieUrl) {
      try {
        const { data } = await axios(
          `movie/${id}/videos?api_key=${API_KEY}&language=en-US`
        );
        const filteredVideo = data.results.filter((item) =>
          ["Trailer", "Teaser"].includes(item.type)
        );
        const recommend = await axios(
          `movie/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
        );
        res.json({
          data: movieData,
          video: filteredVideo,
          recommend: recommend.data,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        tvData = await axios(`tv/${id}?api_key=${API_KEY}&language=en-US`);
        const { data } = await axios(
          `tv/${id}/videos?api_key=${API_KEY}&language=en-US`
        );
        const filteredVideo = data.results.filter((item) =>
          ["Trailer", "Teaser"].includes(item.type)
        );

        const recommend = await axios(
          `tv/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
        );
        res.json({
          data: tvData.data,
          video: filteredVideo,
          recommend: recommend.data,
        });
      } catch (err) {
        console.log(err);
      }
    }

    if (!movieData && !tvData) next(CustomError.notfound("no data found"));
  },
  async listControll(req, res, next) {
    const { item } = req.body;
    if (!item) return next(CustomError.notValid("item Object required"));
    const { error } = wishListValidate.validate(req.body.item);
    if (error) return next(error);
    try {
      const existsUser = await Wishlist.findOne({ id: req.user.id });
      if (!existsUser) {
        await Wishlist.create({ id: req.user.id, list: item });
        res.sendStatus(201);
      } else {
        try {
          const result = existsUser.list.filter((el) => el.id == item.id);
          if (result.length > 0) {
            await Wishlist.updateMany(
              { id: req.user.id },
              { $pull: { list: { id: item.id } } },
              { multi: true }
            );
            res.sendStatus(204);
          } else {
            await Wishlist.findOneAndUpdate(
              { id: req.user.id },
              { $push: { list: item } }
            );
            res.sendStatus(201);
          }
        } catch (error) {
          return next(CustomError.limitReach());
        }
      }
    } catch (error) {
      return next(error);
    }
  },
  async getlist(req, res, next) {
    try {
      const data = await Wishlist.findOne({ id: req.user.id }).select(
        "list -_id"
      );
      res.json(data);
    } catch (error) {
      return next(error);
    }
  },

  async topratedT(req, res, next) {
    try {
      const { data } = await axios(Request.TTopRated);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },

  async trending(req, res, next) {
    try {
      const { data } = await axios(Request.Trending);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async netflixoriginals(req, res, next) {
    try {
      const { data } = await axios(Request.NetflixOriginals);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async discoverM(req, res, next) {
    try {
      const { data } = await axios(Request.MovieDiscover);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async discoverT(req, res, next) {
    try {
      const { data } = await axios(Request.TvDiscover);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async actioM(req, res, next) {
    try {
      const { data } = await axios(Request.ActionMovie);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async comedyM(req, res, next) {
    try {
      const { data } = await axios(Request.ComedyMovie);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async horrerM(req, res, next) {
    try {
      const { data } = await axios(Request.HorrorMovie);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async romanceM(req, res, next) {
    try {
      const { data } = await axios(Request.RomanceMovie);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async documentoryM(req, res, next) {
    try {
      const { data } = await axios(Request.Documentaries);
      res.json({ ...data });
    } catch (error) {
      return next(error);
    }
  },
  async search(req, res, next) {
    try {
      const { title, page } = req.query;
      if (page) {
        const { data } = await axios(
          `${Request.Search}&query=${title}&page=${page}`
        );
        res.json({ ...data });
      } else {
        const { data } = await axios(`${Request.Search}&query=${title}`);
        res.json({ ...data });
      }
    } catch (error) {
      return next(error);
    }
  },
};
