export interface CareerStory {
  id: string;
  track: 'internships' | 'placements';
  authorName: string;
  authorDetails: string;
  title: string;
  excerpt: string;
  likes: number;
  avatarUrl?: string;
}

export const careerStories: CareerStory[] = [
  {
    id: 'samsung-rd',
    track: 'placements',
    authorName: 'Tanushree Dewangan',
    authorDetails: 'B. Tech | 2026',
    title: 'Samsung R&D',
    excerpt: 'How I Prepared for the Online Assessment (OA) To get ready for the OA, I focused mainly on Data Stru...',
    likes: 6,
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'intern-prep-nvidia',
    track: 'internships',
    authorName: 'Arjun S. Nair',
    authorDetails: 'B.Tech | 2026',
    title: 'Intern Prep',
    excerpt: 'Details: Name - Arjun S Nair Company - NVIDIA Batch - 2022 Role - ASIC Design Intern Year of Intern...',
    likes: 5,
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 'analog-devices',
    track: 'internships',
    authorName: 'Astik Sharma',
    authorDetails: 'B.Tech | 2026',
    title: 'Analog devices',
    excerpt: 'Name: Astik Sharma Company: Analog devices Batch: 2022-26 Role: Digital Design Intern Year of intern...',
    likes: 5,
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'intern-prep-ti',
    track: 'internships',
    authorName: 'Praneeth KSS',
    authorDetails: 'B.Tech | 2026',
    title: 'Intern prep',
    excerpt: 'Details Name: Praneeth KSS Company: Texas Instruments Batch: 2022 Role: Analog/Digital Intern...',
    likes: 3,
    avatarUrl: 'https://i.pravatar.cc/150?img=13',
  },
  {
    id: 'google',
    track: 'internships',
    authorName: 'Lovely',
    authorDetails: 'B.Tech | 2026',
    title: 'Google',
    excerpt: '• Role- SDE • Year of Internship- 2025 • Mode of Internship- Onsite...',
    likes: 2,
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
  },
  {
    id: 'intern-prep-intel',
    track: 'internships',
    authorName: 'Prashant Narang',
    authorDetails: 'B. Tech | 2027',
    title: 'Intern Preparation (Intel)',
    excerpt: 'Name: Prashant Narang Company: INTEL Batch: 2023 Role: Memory Design Intern...',
    likes: 2,
    avatarUrl: 'https://i.pravatar.cc/150?img=14',
  }
];
