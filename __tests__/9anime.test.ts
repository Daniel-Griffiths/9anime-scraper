import { searchShows, getEpisodes, getVideo } from "./../src/9anime";

it(
  "can search for videos",
  async () => {
    const [show] = await searchShows("jojo");
    const [episode] = await getEpisodes(show.value.href);
    const video = await getVideo(episode.value.href);

    expect(video).toMatch(new RegExp("https://(.*)/video.mp4"));
  },
  1000 * 30
);
