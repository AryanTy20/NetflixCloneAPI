import { API_KEY } from "../../config";
export const Request = {
  Trending: `trending/all/week?api_key=${API_KEY}&language=en-US&adult=false`,
  NetflixOriginals: `discover/tv?api_key=${API_KEY}&with_networks=213&adult=false`,
  TvDiscover: `discover/tv?api_key=${API_KEY}&language=en-US&page=1&with_watch_providers=Netflix&adult=false`,
  MovieDiscover: `discover/movie?api_key=${API_KEY}&language=en-US&page=1&with_watch_providers=Netflix&adult=false`,
  TTopRated: `tv/top_rated?api_key=${API_KEY}&adult=false`,
  MTopRated: `movie/top_rated?api_key=${API_KEY}&adult=false`,
  ActionMovie: `/discover/movie?api_key=${API_KEY}&with_genres=28&adult=false`,
  ComedyMovie: `/discover/movie?api_key=${API_KEY}&with_genres=35&adult=false`,
  HorrorMovie: `/discover/movie?api_key=${API_KEY}&with_genres=27&adult=false`,
  RomanceMovie: `/discover/movie?api_key=${API_KEY}&with_genres=10749&adult=false`,
  Documentaries: `/discover/movie?api_key=${API_KEY}&with_genres=99&adult=false`,
  Search: `search/multi?api_key=${API_KEY}&language=en-US&page=1&adult=false`,
};
