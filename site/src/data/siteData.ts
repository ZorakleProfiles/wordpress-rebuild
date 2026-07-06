export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  tags: string[];
  content: string[];
};

export const navLinks = [
  { href: "/", label: "Home" },
  {
    href: "/solutions/franchisors",
    label: "Solutions",
    children: [
      { href: "/solutions/franchisors", label: "For Franchisors" },
      { href: "/solutions/brokers", label: "For Brokers" }
    ]
  },
  { href: "/pricing/franchisor", label: "Pricing" },
  {
    href: "/resources/blog",
    label: "Resources",
    children: [
      { href: "/resources/blog", label: "Blog" },
      { href: "/resources/partnerships", label: "Partnerships" }
    ]
  },
  { href: "/about", label: "About" }
];

export const testimonials = [
  {
    name: "Jack & Jill Johnson",
    org: "Franchise Insiders",
    quote:
      "Zorakle Profiles has been a game changer for our business. This powerful tool has helped us find more precise franchise matches for our clients that fit \"their why\". Additionally, Zorakle gives us keen insight into how to best work with our clients in terms of their pace and how they will react in different situation, thereby increasing our chances to bring the deal home. This tool is worth 100x what we pay for it.",
    avatar: "avatar-jeffrey"
  },
  {
    name: "Marcos Moura",
    org: "Amada Senior Care",
    quote:
      "Zorakle's products have enabled us to target, attract, and motivate the right franchise partners to inquire about our franchise opportunity. I can't imagine growing our system without Rebecca Monet's influence and expertise. Awarding franchises is too big of a decision to leave to chance and a \"gut feeling\". With Zorakle, we're able to make the decision to award a franchise based fit, values, and aptitude – this alone has had a hugely positive affect on our franchisee validation and our strong Item 19 performance.",
    avatar: "avatar-seth"
  },
  {
    name: "Sean Hart",
    org: "American Family Care",
    quote:
      "You guys have given me the tools to see the inner workings of our franchise candidates. I had the \"gut\" but the unbiased, scientific data gives us direction. I believe in this stuff. It gives me control to create my corporate culture and that leads to every kind of success. Zorakle Profiles is like the key to reading a foreign language of personality.",
    avatar: "avatar-margaret"
  }
];

export const franchisorFaq = [
  {
    q: "What contract terms do you offer?",
    a: "Zorakle plans are available as monthly or annual subscriptions. Annual subscriptions come with savings and are a common choice for growth-stage systems."
  },
  {
    q: "Can I cancel anytime?",
    a: "Monthly plans can be cancelled at any time. Annual plans run for the full term of the agreement."
  },
  {
    q: "Can I switch plans mid-subscription?",
    a: "Yes. You can upgrade at any time. Downgrades take effect at the end of your current billing period."
  },
  {
    q: "What support is included?",
    a: "All plans include standard support. Established and enterprise plans include priority support, with enterprise options adding SLA-backed response commitments."
  }
];

export const brokerFaq = [
  {
    q: "How does SpotOn! Match work for brokers?",
    a: "Your client completes a single assessment and receives ranked franchise matches with fit scoring and rationale."
  },
  {
    q: "Do annual plans include savings?",
    a: "Yes. Annual subscriptions include discounted pricing compared to month-to-month rates."
  },
  {
    q: "Can I start pay-as-you-go?",
    a: "Yes. Broker membership includes a pay-as-you-go option for teams that need flexibility during ramp-up."
  }
];

export const blogPosts: BlogPost[] = [
  {
    slug: "jenna-law-on-building-brands",
    title:
      "Jenna Law on Building Brands, Leading with Confidence, and Why Generalists Win in Franchising",
    date: "May 20, 2026",
    category: "Podcasts",
    tags: ["Jenna Law", "Keke's Breakfast Cafe", "Rebecca Monet", "The Franchise Woman"],
    excerpt:
      "In franchising, growth is not just about adding locations. It is about building a brand people believe in.",
    content: [
      "In this episode of The Franchise Woman Podcast, Rebecca Monet and Tracy Kawa sit down with Jenna Law, Senior Director of Brand Marketing and Communications at Keke's Breakfast Cafe.",
      "Jenna shares how generalists become high-impact leaders by connecting teams, translating strategy, and moving organizations through change.",
      "Her core message is clear: leadership is not about title. It is about changing the temperature of the room and helping people move forward with clarity."
    ]
  },
  {
    slug: "how-mellow-mushroom-scales",
    title: "How Mellow Mushroom Scales a 50-Year Franchise Without Becoming Cookie-Cutter",
    date: "May 13, 2026",
    category: "Podcasts",
    tags: ["Mellow Mushroom", "Jamie Cecil", "Elizabeth Brasch"],
    excerpt:
      "Consistency matters in franchising, but rigid replication is not the only path to scalable growth.",
    content: [
      "Rebecca Monet and Tracy Kawa explore how Mellow Mushroom balances brand consistency with local expression.",
      "The conversation covers franchise systems, people-first leadership, and operational guardrails that support creative execution."
    ]
  },
  {
    slug: "responsible-franchising-starts-with-hiring",
    title: "Responsible Franchising Starts with Hiring: Dominique Main's Mission to Solve the People Problem",
    date: "May 6, 2026",
    category: "Podcasts",
    tags: ["Dominique Main", "HireNetix"],
    excerpt: "Franchising systems do not run themselves. People run them.",
    content: [
      "This episode focuses on one of the biggest pressure points in franchising: hiring for role fit, values alignment, and long-term performance.",
      "Dominique Main shares practical approaches to move from reactive recruiting to strategic talent selection."
    ]
  }
];

