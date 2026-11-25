// Subcategory tiles shown at the top of collection pages, keyed by collection slug.
// Rendered by src/components/commerce/collection-subcategories.tsx.
//
// This is the only file to edit when the client supplies final links and images:
//   href   A site path such as "/collections/eternity-rings"; a query string is allowed.
//          A link back to the tile's own collection page may only carry ?shape=<Shape>: shape is
//          the one filter the page reads from the URL on every navigation (a domain test
//          enforces this).
//          Leave it out until the link exists: the tile then links to its own collection page.
//   image  A file under public/, written as a site path. New artwork goes in
//          public/images/subcategories/<collection>/ (for example
//          "/images/subcategories/wedding/eternity-rings.jpg").
//          A remote URL also works, but prefer local files: next/image only resizes remote hosts
//          listed in images.remotePatterns in next.config.ts (today only images.unsplash.com and
//          cdn.builder.io). The strip resizes local files and Unsplash URLs; an image on any
//          other host is shown as it is, unresized, so keep such a file small (about 400px).
//          Leave it out until the image exists: the tile then shows a placeholder frame.
//
// Keep this module free of runtime imports so tests/domain.test.mjs can load it directly.

export type CollectionSubcategory = {
  name: string;    // label under the image
  href?: string;   // site path, may include a query. Omit until the client supplies the link.
  image?: string;  // /public path or an allowed remote URL. Omit until the client supplies the image.
};

export type CollectionSubcategoryGroup = {
  heading: string;                 // "Shop by Diamond Shape"
  imageFit: "contain" | "cover";   // contain for white-background cut-outs, cover for photography
  items: CollectionSubcategory[];
};

// PLACEHOLDER photography: the stock photos the rest of the site already uses, named after what
// each one shows. Replace every `placeholder.…` below with the client's own image for that tile.
const stock = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&h=400&q=80`;
const placeholder = {
  ring: stock("photo-1605100804763-247f67b3557e"),     // halo ring on black
  pearls: stock("photo-1515562141207-7a88fb7ce338"),   // pearl necklace in a box
  rings: stock("photo-1617038220319-276d3cfab638"),    // gold rings on a shell
  pendant: stock("photo-1599643478518-a784e5dc4c8f"),  // pendant necklaces
};

export const collectionSubcategories: Record<string, CollectionSubcategoryGroup> = {
  engagement: {
    heading: "Shop by Diamond Shape",
    imageFit: "contain",
    items: [
      { name: "Round", href: "/collections/engagement?shape=Round", image: "/images/shapes/round.png" },
      { name: "Oval", href: "/collections/engagement?shape=Oval", image: "/images/shapes/oval.png" },
      { name: "Pear", href: "/collections/engagement?shape=Pear", image: "/images/shapes/pear.png" },
      { name: "Marquise", href: "/collections/engagement?shape=Marquise", image: "/images/shapes/marquise.png" },
      { name: "Heart", href: "/collections/engagement?shape=Heart" }, // no heart artwork in the repo yet
      { name: "Cushion", href: "/collections/engagement?shape=Cushion", image: "/images/shapes/cushion.png" },
      { name: "Radiant", href: "/collections/engagement?shape=Radiant", image: "/images/shapes/radiant.png" },
      { name: "Asscher", href: "/collections/engagement?shape=Asscher", image: "/images/shapes/asscher.png" },
      { name: "Princess", href: "/collections/engagement?shape=Princess", image: "/images/shapes/princess.png" },
      { name: "Emerald", href: "/collections/engagement?shape=Emerald", image: "/images/shapes/emerald.png" },
    ],
  },
  wedding: {
    heading: "Shop by Style",
    imageFit: "cover",
    items: [
      { name: "Eternity Rings", image: placeholder.ring },
      { name: "Half Eternity Rings", image: placeholder.pearls },
      { name: "Open Cuff Bands", image: placeholder.pendant },
      { name: "Curved Bands", image: placeholder.rings },
    ],
  },
  earrings: {
    heading: "Shop by Style",
    imageFit: "cover",
    items: [
      { name: "Stud", image: placeholder.rings },
      { name: "Dangle", image: placeholder.pendant },
      { name: "Hoop", image: placeholder.pearls },
      { name: "Bridal", image: placeholder.ring },
    ],
  },
  necklaces: {
    heading: "Shop by Style",
    imageFit: "cover",
    items: [
      { name: "Tennis Necklace", image: placeholder.pearls },
    ],
  },
  bracelets: {
    heading: "Shop by Style",
    imageFit: "cover",
    items: [
      { name: "Tennis Bracelet", image: placeholder.pendant },
      { name: "Solitaire Chain Bracelet", image: placeholder.pearls },
    ],
  },
};
