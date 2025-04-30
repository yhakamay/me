interface Guid {
  _: string;
  $: {
    isPermaLink: string;
  };
}

interface Enclosure {
  $: {
    url: string;
    length: string;
    type: string;
  };
}

interface ArticleData {
  title: string[];
  description: string[];
  link: string[];
  guid: Guid[];
  pubDate: string[];
  enclosure: Enclosure[];
  "dc:creator": string[];
}

export default ArticleData;
