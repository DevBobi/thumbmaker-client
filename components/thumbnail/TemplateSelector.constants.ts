export const CONTENT_OPTIONS = [
    { value: "all", label: "All Contents" },
    { value: "gaming", label: "Gaming" },
    { value: "tech", label: "Tech" },
    { value: "vlog", label: "Vlog" },
    { value: "entertainment", label: "Entertainment" },
    { value: "education", label: "Education" },
    { value: "sports", label: "Sports" },
    { value: "music", label: "Music" },
    { value: "cooking", label: "Cooking" },
    { value: "travel", label: "Travel" },
];

export const SUB_NICHE_OPTIONS = [
    { value: "all", label: "All Sub-niches" },
    { value: "action", label: "Action" },
    { value: "strategy", label: "Strategy" },
    { value: "rpg", label: "RPG" },
    { value: "moba", label: "MOBA" },
    { value: "fps", label: "FPS" },
    { value: "mmo", label: "MMO" },
];

export const NICHE_OPTIONS = [
    { value: "all", label: "All Niches" },
    { value: "coaching", label: "Coaching" },
    { value: "ecommerce", label: "Ecommerce" },
    { value: "education", label: "Education" },
    { value: "entrepreneurship", label: "Entrepreneurship" },
    { value: "entertainment", label: "Entertainment" },
    { value: "finance", label: "Finance" },
    { value: "productivity", label: "Productivity" },
    { value: "science_tech", label: "Science & Technology" },
    { value: "self_help", label: "Self Help" },
    { value: "startup", label: "Startup" },
    { value: "technology", label: "Technology" },
];

export const CREATOR_OPTIONS = [
    { value: "all", label: "All Creators" },
    { value: "pro", label: "Pro" },
    { value: "beginner", label: "Beginner" },
    { value: "expert", label: "Expert" },
    { value: "influencer", label: "Influencer" },
    { value: "brand", label: "Brand" },
];


// Mock templates

// Mock data for user templates
export interface SelfTemplate {
    id: string;
    title: string;
    image: string;
    category: string;
    creator: string;
    video_link: string;
    view_count: string;
  }
export const MOCK_USER_TEMPLATES: SelfTemplate[] = [
    {
      id: "u1",
      title: "My Gaming Template",
      image: "https://picsum.photos/1280/720?random=13",
      category: "gaming",
      creator: "self",
      video_link: "#",
      view_count: "0"
    },
    {
      id: "u2",
      title: "Custom Tech Review",
      image: "https://picsum.photos/1280/720?random=14",
      category: "tech",
      creator: "self",
      video_link: "#",
      view_count: "0"
    },
    {
      id: "u3",
      title: "Personal Vlog",
      image: "https://picsum.photos/1280/720?random=15",
      category: "vlog",
      creator: "self",
      video_link: "#",
      view_count: "0"
    },
  ];

export interface Template {
    id: string;
    title: string;
    image: string;
    category: string;
}

export const MOCK_TEMPLATES: Template[] = [
    {
        id: "1",
        title: "Gaming Action",
        image: "https://picsum.photos/1280/720?random=1",
        category: "gaming",
    },
    {
        id: "2",
        title: "Tech Review",
        image: "https://picsum.photos/1280/720?random=2",
        category: "tech",
    },
    {
        id: "3",
        title: "Vlog Style",
        image: "https://picsum.photos/1280/720?random=3",
        category: "vlog",
    },
    {
        id: "4",
        title: "Tutorial",
        image: "https://picsum.photos/1280/720?random=4",
        category: "tutorial",
    },
    {
        id: "5",
        title: "Product Showcase",
        image: "https://picsum.photos/1280/720?random=5",
        category: "product",
    },
    {
        id: "6",
        title: "News Style",
        image: "https://picsum.photos/1280/720?random=6",
        category: "news",
    },
    {
        id: "7",
        title: "Entertainment",
        image: "https://picsum.photos/1280/720?random=7",
        category: "entertainment",
    },
    {
        id: "8",
        title: "Educational",
        image: "https://picsum.photos/1280/720?random=8",
        category: "education",
    },
    {
        id: "9",
        title: "Sports",
        image: "https://picsum.photos/1280/720?random=9",
        category: "sports",
    },
    {
        id: "10",
        title: "Music",
        image: "https://picsum.photos/1280/720?random=10",
        category: "music",
    },
    {
        id: "11",
        title: "Cooking",
        image: "https://picsum.photos/1280/720?random=11",
        category: "cooking",
    },
    {
        id: "12",
        title: "Travel",
        image: "https://picsum.photos/1280/720?random=12",
        category: "travel",
    },
];