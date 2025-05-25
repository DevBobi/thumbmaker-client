export const CREATOR_OPTIONS = [
    { value: "all", label: "All Creators" },
    { value: "pro", label: "Pro" },
    { value: "beginner", label: "Beginner" },
    { value: "expert", label: "Expert" },
    { value: "influencer", label: "Influencer" },
    { value: "brand", label: "Brand" },
];

// Mock data for user templates
export interface SelfTemplate {
    id: string;
    title: string;
    image: string;
    creator: string;
    video_link: string;
    tags: string;
}
export const MOCK_USER_TEMPLATES: SelfTemplate[] = [
    {
      id: "u1",
      title: "My Gaming Template",
      image: "https://picsum.photos/1280/720?random=13",
      creator: "self",
      video_link: "#",
      tags: ""
    },
    {
      id: "u2",
      title: "Custom Tech Review",
      image: "https://picsum.photos/1280/720?random=14",
      creator: "self",
      video_link: "#",
      tags: ""
    },
    {
      id: "u3",
      title: "Personal Vlog",
      image: "https://picsum.photos/1280/720?random=15",
      creator: "self",
      video_link: "#",
      tags: ""
    },
  ];

export interface Template {
    id: string;
    title: string;
    image: string;
    category: string;
}
