export type SupportStepMediaType = "screenshot" | "gif" | "video";

export interface SupportStepMedia {
  type: SupportStepMediaType;
  fileName: string;
  alt: string;
  caption?: string;
}

export interface SupportArticleStep {
  title: string;
  content: string;
  tip?: string;
  media: SupportStepMedia;
}


export interface SupportArticle {
  slug: string;
  title: string;
  summary: string;
  assetDir: string;
  type: string;
  summaryVideo?: {
    fileName: string;
    posterFileName?: string;
    caption?: string;
  };
  steps: SupportArticleStep[];
}

export const supportArticles: SupportArticle[] = [

  {
    slug: "established-franchisor-setup",
    title: "Setting Up Your Established Franchisor Account",
    summary:
      "Use this guide to complete your benchmark setup and generate a reliable franchise blueprint from your existing operator data.",
    assetDir: "src/assets/support/established-franchisor-setup",
    type:"Established Franchisor",
    steps: [
      {
        title: "Take the Franchise Benchmark Audit",
        content:
          "After logging in, you'll see your Algorithm Setup Checklist. The first step is to complete the Franchise Benchmark Audit, which defines the standards and operator profile targets for your franchise system. Click the Get Started button to begin.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Algorithm Setup Checklist with Get Started button highlighted"
        }
      },
      {
        title: "Send Warm-Up Emails to Research Participants",
        content:
          "Notify your franchisees in advance so they understand the purpose of the research assessment and are prepared to complete it. Click the Get Samples button to access ready-to-use email templates provided for your convenience.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Notify Franchisees section with Get Samples button"
        }
      },
      {
        title: "Upload Your Current Franchisees",
        content:
          "Add franchisees in one of two ways: click Add Franchisee to enter them manually, or download the Sample CSV template, fill in your data, and upload it using the Upload Franchisees button. All that's required is each franchisee's first name, last name, and email address.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Upload Franchisees panel with Add Franchisee and Upload CSV options"
        }
      },
      {
        title: "Send Research Assessments to Franchisees",
        content:
          "After uploading your franchisees, a Send Research Assessments button will appear along with a count of pending invitations. Click the button to send assessments. Duplicates are never sent automatically.",
        media: {
          type: "screenshot",
          fileName: "04.png",
          alt: "Send Research Assessments button with pending count"
        }
      },
      {
        title: "Select Your Performance Metrics",
        content:
          "Choose the performance metrics your organization uses to measure franchisee success.",
        media: {
          type: "screenshot",
          fileName: "05.png",
          alt: "Performance metrics selection screen"
        }
      },
      {
        title: "Rank Your Performance Metrics",
        content:
          "If you selected more than one performance metric, rank them in order of importance. If you selected only one metric, this step will not appear.",
        media: {
          type: "screenshot",
          fileName: "06.png",
          alt: "Performance metrics ranking screen"
        }
      },
      {
        title: "Enter Franchisee Performance Data",
        content:
          "Entering performance data for each franchisee is optional, but it helps Zorakle auto-categorize franchisees in the next step. You can enter data manually or download the Sample CSV, populate it with your data, and upload it using the Upload Metrics button.",
        media: {
          type: "screenshot",
          fileName: "07.png",
          alt: "Franchisee performance data entry with CSV upload option"
        }
      },
      {
        title: "Categorize Franchisees",
        content:
          "If you provided performance data, Zorakle will automatically categorize your franchisees by performance tier. If no data was provided, you can categorize them manually.",
        media: {
          type: "screenshot",
          fileName: "08.png",
          alt: "Franchisee categorization screen"
        }
      },
      {
        title: "Track Research Assessment Progress",
        content:
          "You need at least 5 top-performing (A) and 5 underperforming (C) franchisees to complete the assessment before generating your blueprint. Click the View Progress button in the Track Research Assessments section. From there you can view in-progress assessments with shareable links and access reports for completed ones.",
        media: {
          type: "screenshot",
          fileName: "09.png",
          alt: "Track Research Assessments progress view"
        }
      },
      {
        title: "Generate Your Blueprint",
        content:
          "Once the minimum assessment threshold is met, generate your blueprint. The Zorakle team will review it and notify you when it has been approved. You can then begin evaluating prospective franchisees using your personalized blueprint and algorithm.",
        media: {
          type: "screenshot",
          fileName: "10.png",
          alt: "Generate Blueprint button and approval status"
        }
      }
    ]
  },
  {
    slug: "emerging-franchisor-setup",
    title: "Setting Up Your Emerging Franchisor Account",
    summary:
      "Use this quick flow to create your algorithm and begin evaluating prospective franchisees.",
    assetDir: "src/assets/support/emerging-franchisor-setup",
    type:"Emerging Franchisor",
    steps: [
      {
        title: "Take the Franchise Benchmark Audit",
        content:
          "When you log in you will see your Algorithm setup checklist. The first step is to complete the benchmark audit to define the standards and operator profile targets for your franchise system. Just click on the \"Get Started\" button to start taking your Franchise Benchmark Audit.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Placeholder screenshot for franchise benchmark audit"
        }
      },
      {
        title: "Blueprint and Algorithm Created",
        content:
          "After the audit is complete, Zorakle generates your initial blueprint and matching algorithm.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Placeholder screenshot for blueprint and algorithm creation"
        }
      },
      {
        title: "Start Sending Assessments to Prospective Franchisees",
        content:
          "Begin sharing assessment links with prospective franchisees so you can evaluate fit using your new blueprint and algorithm.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Placeholder screenshot for sending assessments"
        }
      }
    ]
  },
  {
    slug: "broker-setup",
    title: "Setting Up Your Broker Account",
    summary:
        "Use this quick flow to get started as a broker/consultant.",
    assetDir: "src/assets/support/broker-setup",
    summaryVideo: {
      fileName: "summary.mp4",
      caption: "Quick walkthrough: broker setup and branding"
    },
    type:"Broker",
    steps: [
      {
        title: "Open Logo and Branding Settings",
        content:
            "Click Settings, then navigate to Logo and Branding.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Settings menu with Logo and Branding highlighted"
        }
      },
      {
        title: "Upload Your Logo",
        content:
            "Upload your logo file. The system will suggest brand colors automatically. Select one of those or enter a custom hex code for an exact match.",
        tip:
            "If your brand has a specific hex code from your style guide, use the custom hex field to match your brand exactly.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Logo upload panel with generated color swatches and hex input"
        }
      },
    ]
  }
];