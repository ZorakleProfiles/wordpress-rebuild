export interface ScienceLesson {
  number: number;
  title: string;
  videoUrl: string;
  explanation: string;
}

export interface ScienceTopic {
  slug: string;
  shortTitle: string;
  title: string;
  summary: string;
  lessons: ScienceLesson[];
}

export const scienceTopics: ScienceTopic[] = [
  {
    slug: "overview",
    shortTitle: "Overview",
    title: "SpotOn! Basics: Overview",
    summary:
      "Start here for the big picture. This introduction explains how SpotOn! brings values, stage of growth, culture, work style, and competencies together to create a fuller view of fit. Use it as your map for the lessons that follow.",
    lessons: [
      {
        number: 1,
        title: "Science Overview",
        videoUrl: "https://player.vimeo.com/video/1037075151",
        explanation:
          "An introduction to the SpotOn! science framework and the role each dimension plays in understanding alignment. This lesson shows why the sciences are most useful when considered together instead of as isolated scores."
      }
    ]
  },
  {
    slug: "values",
    shortTitle: "Values",
    title: "SpotOn! Basics: Values",
    summary:
      "These lessons introduce the four values orientations measured by SpotOn!: Belonger, Emulator, Achiever, and Societal. Together, they help explain what a person prioritizes, what motivates their decisions, and what kind of opportunity is most likely to feel meaningful. The final lesson shows how to interpret the distribution of those values on a splatter chart.",
    lessons: [
      {
        number: 2,
        title: "The Values of a Belonger",
        videoUrl: "https://player.vimeo.com/video/1037075278",
        explanation:
          "Explore the Belonger orientation and its emphasis on connection, trust, stability, and being part of a group. The lesson helps you recognize how belonging can shape motivation and decision-making."
      },
      {
        number: 3,
        title: "The Values of an Emulator",
        videoUrl: "https://player.vimeo.com/video/1037075323",
        explanation:
          "Learn how the Emulator orientation is influenced by visible examples of success, recognition, and aspiration. This lesson explains what people with this values pattern may look for in a business and its community."
      },
      {
        number: 4,
        title: "The Values of an Achiever",
        videoUrl: "https://player.vimeo.com/video/1037075382",
        explanation:
          "Understand the Achiever orientation, including its focus on progress, autonomy, goals, and measurable results. The lesson connects achievement-driven motivation to the way opportunities are evaluated."
      },
      {
        number: 5,
        title: "The Values of a Societal",
        videoUrl: "https://player.vimeo.com/video/1037075427",
        explanation:
          "Discover the Societal orientation and its focus on contribution, purpose, and positive impact. This lesson highlights why mission and broader community outcomes may be central to a person's choices."
      },
      {
        number: 6,
        title: "How to Read Splatter Charts",
        videoUrl: "https://player.vimeo.com/video/1037075463",
        explanation:
          "Learn how to read a SpotOn! splatter chart and make sense of the overall values pattern. The lesson focuses on interpreting the relationship among the data points rather than treating any single value as the whole story."
      }
    ]
  },
  {
    slug: "stage-of-growth",
    shortTitle: "Stage of Growth",
    title: "SpotOn! Basics: Stage of Growth",
    summary:
      "This series follows a business system through five stages of growth: Entrepreneurial, Partnership, Plug & Play, Empire, and Hybrid. Each stage brings a different balance of structure, flexibility, leadership, and support. Taken together, the lessons help clarify which environment a person is prepared to enter and where expectations may need alignment.",
    lessons: [
      {
        number: 7,
        title: "Stage of Growth 1 — The Entrepreneurial Stage",
        videoUrl: "https://player.vimeo.com/video/1037075518",
        explanation:
          "Meet the earliest stage of a system, where experimentation, ambiguity, and founder-led change are common. This lesson explains the adaptability and initiative often needed to thrive while the model is still taking shape."
      },
      {
        number: 8,
        title: "Stage of Growth 2 — The Partnership Stage",
        videoUrl: "https://player.vimeo.com/video/1037075580",
        explanation:
          "See how the relationship shifts as a growing system develops through active collaboration between the brand and its operators. The lesson explores shared problem-solving, feedback, and mutual influence."
      },
      {
        number: 9,
        title: "Stage of Growth 3 — The Plug & Play Stage",
        videoUrl: "https://player.vimeo.com/video/1037075668",
        explanation:
          "Learn about a more established stage in which processes, resources, and expectations are increasingly defined. This lesson considers the value of following a proven model with consistency."
      },
      {
        number: 10,
        title: "Stage of Growth 4 — The Empire Stage",
        videoUrl: "https://player.vimeo.com/video/1037075762",
        explanation:
          "Explore the scale, infrastructure, and brand strength associated with a mature system. The lesson highlights how operating within a large organization can change the resources available and the rules of engagement."
      },
      {
        number: 11,
        title: "Stage of Growth 5 — The Hybrid Stage",
        videoUrl: "https://player.vimeo.com/video/1037075820",
        explanation:
          "Understand how a Hybrid system combines characteristics from multiple growth stages. This lesson shows why different parts of the same organization may offer different levels of structure, collaboration, and autonomy."
      }
    ]
  },
  {
    slug: "culture",
    shortTitle: "Culture",
    title: "SpotOn! Basics: Culture",
    summary:
      "These lessons cover four common organizational culture patterns: Collaborate, Create, Compete, and Control. Each culture rewards different behaviors and defines success differently. Seeing the four together makes it easier to understand the environment a brand creates and whether a person's preferred way of operating will align with it.",
    lessons: [
      {
        number: 12,
        title: "The Collaborate Culture",
        videoUrl: "https://player.vimeo.com/video/1037075899",
        explanation:
          "Explore a people-centered culture built around teamwork, participation, and shared commitment. This lesson explains how relationships and collective problem-solving influence the day-to-day environment."
      },
      {
        number: 13,
        title: "The Create Culture",
        videoUrl: "https://player.vimeo.com/video/1037075950",
        explanation:
          "Learn about a dynamic culture that values innovation, experimentation, and new ideas. The lesson considers how comfort with change and calculated risk supports success in a Create environment."
      },
      {
        number: 14,
        title: "The Compete Culture",
        videoUrl: "https://player.vimeo.com/video/1037075996",
        explanation:
          "Understand a results-oriented culture focused on achievement, momentum, and winning in the market. This lesson shows how ambitious goals and external performance measures can shape expectations."
      },
      {
        number: 15,
        title: "The Control Culture",
        videoUrl: "https://player.vimeo.com/video/1037076046",
        explanation:
          "Examine a structured culture that prizes reliability, standards, and efficient execution. The lesson explains how clear processes and consistency create stability in a Control environment."
      }
    ]
  },
  {
    slug: "work-style",
    shortTitle: "Work Style",
    title: "SpotOn! Basics: Work Style",
    summary:
      "This series introduces four work styles: Director, Promoter, Connector, and Thinker. The styles describe how people tend to approach action, communication, relationships, and information. Together, the lessons provide practical language for understanding natural strengths, preferences, and potential friction on a team.",
    lessons: [
      {
        number: 16,
        title: "The Director Work Style",
        videoUrl: "https://player.vimeo.com/video/1037076624",
        explanation:
          "Learn how the Director style approaches decisions, challenges, and forward movement. This lesson highlights a direct, action-oriented preference and the environments where it can be most effective."
      },
      {
        number: 17,
        title: "The Promoter Work Style",
        videoUrl: "https://player.vimeo.com/video/1037076677",
        explanation:
          "Explore the Promoter style's energetic, expressive, and opportunity-focused approach. The lesson shows how enthusiasm and influence can help build momentum and engage others."
      },
      {
        number: 18,
        title: "The Connector Work Style",
        videoUrl: "https://player.vimeo.com/video/1037076739",
        explanation:
          "Understand the Connector style and its steady, supportive focus on people and cooperation. This lesson explains how patience, listening, and relationship continuity contribute to a team."
      },
      {
        number: 19,
        title: "The Thinker Work Style",
        videoUrl: "https://player.vimeo.com/video/1037076805",
        explanation:
          "Discover the Thinker style's analytical, careful, and quality-focused approach. The lesson highlights the importance of evidence, accuracy, and considered planning when making decisions."
      }
    ]
  },
  {
    slug: "competencies",
    shortTitle: "Competencies",
    title: "SpotOn! Basics: Competencies",
    summary:
      "This lesson brings the focus to core competencies: the capabilities and patterns of execution that influence how someone performs in the work itself. It explains how competency information adds a practical performance layer to values, growth-stage, culture, and work-style insights.",
    lessons: [
      {
        number: 20,
        title: "Core Competencies",
        videoUrl: "https://player.vimeo.com/video/1037076872",
        explanation:
          "An introduction to the core competencies measured within SpotOn! and how they connect to performance. This lesson helps frame competencies as one part of the complete fit picture, alongside motivation and environment."
      }
    ]
  }
];

export const scienceTopicBySlug = new Map(
  scienceTopics.map((topic) => [topic.slug, topic])
);
