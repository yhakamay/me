export type Article = {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;
  enclosure: {
    url: string;
    length: number;
    type: string;
  };
  creator: string;
};
