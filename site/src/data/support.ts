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
  intro: string;
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
      "This article walks established franchisors through benchmark setup, franchisee research collection, performance categorization, and final blueprint generation.",
    intro:
      "If you already have operating franchisees, this guide helps you turn that real-world performance data into a practical hiring and evaluation blueprint. You will set your benchmark standards, invite the right participants, and organize results so your final algorithm reflects what success looks like in your system. By the end, you will be ready to generate a blueprint grounded in both behavior insights and actual franchisee outcomes.",
    assetDir: "src/assets/support/established-franchisor-setup",
    type:"Established Franchisor",
    steps: [
      {
        title: "Take the Franchise Benchmark Audit",
        content:
          "After logging in, you'll see your Algorithm Setup Checklist. The first step is to complete the Franchise Benchmark Audit, which defines the standards and operator profile targets for your franchise system. Click the Get Started button to begin, you can save and come back anytime.",
        media: {
          type: "screenshot",
          fileName: "audit.png",
          alt: "Algorithm Setup Checklist with Get Started button highlighted"
        }
      },
      {
        title: "Send Warm-Up Emails to Research Participants",
        content:
          "Notify your franchisees in advance so they understand the purpose of the research assessment and are prepared to complete it. Click the Get Samples button to access ready-to-use email templates provided for your convenience.",
        media: {
          type: "screenshot",
          fileName: "warmup.png",
          alt: "Notify Franchisees section with Get Samples button"
        }
      },
      {
        title: "Upload Your Current Franchisees",
        content:
          "Add franchisees in one of two ways: click Add Franchisee to enter them manually, or download the Sample CSV template, fill in your data, and upload it using the Upload Franchisees button. All that's required is each franchisee's first name, last name, and email address.",
        media: {
          type: "screenshot",
          fileName: "franchisee-upload.png",
          alt: "Upload Franchisees panel with Add Franchisee and Upload CSV options"
        }
      },
      {
        title: "Send Research Assessments to Franchisees",
        content:
          "After uploading your franchisees, a Send Research Assessments button will appear along with a count of pending invitations. Click the button to send assessments. Duplicates are never sent automatically.",
        media: {
          type: "screenshot",
          fileName: "send-assessments.png",
          alt: "Send Research Assessments button with pending count"
        }
      },
      {
        title: "Select Your Performance Metrics",
        content:
          "Choose the performance metrics your organization uses to measure franchisee success.",
        media: {
          type: "screenshot",
          fileName: "add-metrics.png",
          alt: "Performance metrics selection screen"
        }
      },
      {
        title: "Rank Your Performance Metrics",
        content:
          "If you selected more than one performance metric, rank them in order of importance. If you selected only one metric, this step will not appear.",
        media: {
          type: "screenshot",
          fileName: "rank-metrics.png",
          alt: "Performance metrics ranking screen"
        }
      },
      {
        title: "Enter Franchisee Performance Data",
        content:
          "Entering performance data for each franchisee is optional, but it helps Zorakle auto-categorize franchisees in the next step. You can enter data manually or download the Sample CSV, populate it with your data, and upload it using the Upload Metrics button.",
        media: {
          type: "screenshot",
          fileName: "add-franchisee-metrics.png",
          alt: "Franchisee performance data entry with CSV upload option"
        }
      },
      {
        title: "Categorize Franchisees",
        content:
          "If you provided performance data, Zorakle will automatically categorize your franchisees by performance tier. If no data was provided, you can categorize them manually.",
        media: {
          type: "screenshot",
          fileName: "categorize.png",
          alt: "Franchisee categorization screen"
        }
      },
      {
        title: "Track Research Assessment Progress",
        content:
          "You need at least 5 top-performing (A) and 5 underperforming (C) franchisees to complete the assessment before generating your blueprint. Click the View Progress button in the Track Research Assessments section. From there you can view in-progress assessments with shareable links and access reports for completed ones.",
        media: {
          type: "screenshot",
          fileName: "track.png",
          alt: "Track Research Assessments progress view"
        }
      },
      {
        title: "Generate Your Blueprint",
        content:
          "Once the minimum assessment threshold is met, generate your blueprint. The Zorakle team will review it and notify you when it has been approved. You can then begin evaluating prospective franchisees using your personalized blueprint and algorithm.",
        media: {
          type: "screenshot",
          fileName: "generate.png",
          alt: "Generate Blueprint button and approval status"
        }
      }
    ]
  },
  {
    slug: "emerging-franchisor-setup",
    title: "Setting Up Your Emerging Franchisor Account",
    summary:
      "This article explains the fast-start setup for emerging franchisors, from benchmark audit completion to sending your first candidate assessments.",
    intro:
      "This walkthrough is designed for newer franchise systems that need to launch quickly without sacrificing decision quality. It shows how to complete your benchmark audit, review the generated blueprint, and move directly into candidate assessment using your new algorithm. The goal is to give you a clean, repeatable setup flow that gets you evaluating prospects with confidence.",
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
  // {
  //   slug: "broker-setup",
  //   title: "Setting Up Your Broker Account",
  //   summary:
  //     "This article covers broker account branding setup so your workspace reflects your firm before sharing assessments with clients.",
  //   intro:
  //     "This guide helps brokers and consultants personalize their workspace so everything clients see matches their brand. You will update logo and color settings to create a polished presentation experience before sending links or sharing results. It is a short setup, but it improves trust and consistency across your client interactions.",
  //   assetDir: "src/assets/support/broker-setup",
  //   summaryVideo: {
  //     fileName: "summary.mp4",
  //     caption: "Quick walkthrough: broker setup and branding"
  //   },
  //   type:"Broker",
  //   steps: [
  //     {
  //       title: "Open Logo and Branding Settings",
  //       content:
  //           "Click Settings, then navigate to Logo and Branding.",
  //       media: {
  //         type: "screenshot",
  //         fileName: "01.png",
  //         alt: "Settings menu with Logo and Branding highlighted"
  //       }
  //     },
  //     {
  //       title: "Upload Your Logo",
  //       content:
  //           "Upload your logo file. The system will suggest brand colors automatically. Select one of those or enter a custom hex code for an exact match.",
  //       tip:
  //           "If your brand has a specific hex code from your style guide, use the custom hex field to match your brand exactly.",
  //       media: {
  //         type: "screenshot",
  //         fileName: "02.png",
  //         alt: "Logo upload panel with generated color swatches and hex input"
  //       }
  //     },
  //   ]
  // },
  {
    slug: "collect-assessments",
    title: "Collecting Assessments",
    summary:
      "Find your default assessment link, copy it correctly, and use it consistently across campaigns.",
    intro:
      "If you need to start sharing assessments right away, this article shows the fastest path. You will go to Active Links, locate your default link, and copy it for email, landing pages, or direct outreach. Following this flow helps you avoid sending outdated URLs and keeps your lead tracking clean.",
    assetDir: "src/assets/support/getting-your-assessment-link",
    type: "Everyone",
    steps: [
      {
        title: "Go to Assessment Links",
        content:
          "Open the Assessment Links page (Active Links table). This is where all current links are managed.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Assessment Links page with Active Links table"
        }
      },
      {
        title: "Locate your default link",
        content:
          "Find the default company link in the table and confirm the label/source before sharing.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Default assessment link row in Active Links"
        }
      },
      {
        title: "Copy and test the link",
        content:
          "Copy the link and open it in an incognito window to confirm it loads the expected assessment flow.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Copied assessment link being tested in a browser"
        }
      }
    ]
  },
  {
    slug: "create-view-and-manage-assessment-links",
    title: "Create, view and Manage Assessment Links",
    summary:
      "Create new links,review existing links, edit tracking details, and keep your link list organized over time.",
    intro:
      "As campaigns change, your link list can become cluttered or inconsistent. This article shows how to review your active links, update labels and settings, and remove links you no longer use. Keeping links clean prevents reporting confusion and helps your team trust the data.",
    assetDir: "src/assets/support/viewing-and-managing-assessment-links",
    type: "Everyone",
    steps: [
      {
        title: "Open Active Links",
        content:
          "Go to Assessment Links and review all current entries in the Active Links table.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Active Links table with multiple assessment links"
        }
      },
      {
        title: "Edit link details",
        content:
          "Open a link for editing and update label, source type, privacy, description, or assessment options as needed.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Edit Assessment Link modal"
        }
      },
      {
        title: "Retire unused links",
        content:
          "Delete links that are no longer active to keep reporting clean and reduce mistakes when sharing URLs.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Delete confirmation for an assessment link"
        }
      }
    ]
  },
  {
    slug: "cq-setup-and-walkthrough",
    title: "Confidential Questionnaire (CQ) Setup Walkthrough",
    summary:
      "Enable CQ, configure how it runs, and maintain your question set from settings.",
    intro:
      "CQ adds an additional layer of candidate insight beyond the standard assessment flow. This walkthrough covers enabling CQ, linking it to assessments, and managing question settings over time. It is written for teams that want consistent implementation without trial-and-error.",
    assetDir: "src/assets/support/cq-setup-and-walkthrough",
    type: "Everyone",
    steps: [
      {
        title: "Enable CQ from Assessment Links",
        content:
          "On the Assessment Links page, use the Enable Confidential Questionnaire toggle and confirm in the modal.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Enable Confidential Questionnaire toggle on Assessment Links page"
        }
      },
      {
        title: "Choose how CQ is delivered",
        content:
          "Decide whether CQ is part of the assessment flow or separate, then configure each link accordingly.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "CQ delivery options in link configuration"
        }
      },
      {
        title: "Manage CQ content in Settings",
        content:
          "Go to Settings > Confidential Questionnaire to edit sections, add questions, set required panels, and save your configuration.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Confidential Questionnaire settings editor"
        }
      },
      {
        title: "Test before full rollout",
        content:
          "Run a quick internal test using one link so your team can verify the candidate experience and report output.",
        media: {
          type: "screenshot",
          fileName: "04.png",
          alt: "Internal CQ test flow before launch"
        }
      }
    ]
  },
  {
    slug: "user-management-settings",
    title: "Settings: User Management",
    summary:
      "Add users, define access levels, and control who receives reports or billing/referral notifications.",
    intro:
      "User Management is where you control who can log in, what they can see, and who receives key account communications. This guide helps you set permissions clearly from the start, especially for teams with multiple users and private link workflows.",
    assetDir: "src/assets/support/user-management-settings",
    type: "Everyone",
    steps: [
      {
        title: "Open Settings > User Management",
        content:
          "From Settings, select User Management to view the team table and current permissions.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "User Management table in Settings"
        }
      },
      {
        title: "Create a user or report recipient",
        content:
          "Use Create User to add either a login user or a report recipient (email only, no login).",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Create New User or Report Recipient modal"
        }
      },
      {
        title: "Set permissions carefully",
        content:
          "Configure admin access, report email delivery, referral and billing notifications, and private link visibility based on each person's role.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "User permission controls for admin report referral and billing access"
        }
      }
    ]
  },
  {
    slug: "assessment-settings-guide",
    title: "Settings: Assessment Settings",
    summary:
      "Configure report delivery behavior and reminder communication settings for your account.",
    intro:
      "Assessment Settings help you control the candidate communication experience. You can decide whether Business Builder reports are sent automatically and manage reminder-related content. This article is useful for teams standardizing their follow-up process.",
    assetDir: "src/assets/support/assessment-settings-guide",
    type: "Everyone",
    steps: [
      {
        title: "Go to Settings > Assessment Settings",
        content:
          "Open the Assessment Settings tab from your account settings menu.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Assessment Settings tab in account settings"
        }
      },
      {
        title: "Set Business Builder delivery",
        content:
          "Choose whether the system automatically emails the Business Builder profile to prospects or keeps delivery manual.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Business Builder Delivery setting"
        }
      },
      {
        title: "Review reminder settings and save",
        content:
          "Check assessment reminder configuration, then save changes so your outreach behavior matches your process.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Assessment Reminders section and Save Changes button"
        }
      }
    ]
  },
  {
    slug: "company-info-and-branding-settings",
    title: "Settings: Company Info and Branding",
    summary:
      "Update company details and visual branding so shared links and reports match your organization.",
    intro:
      "Your company profile and branding influence how candidates and partners experience your account. This guide shows how to update account information, logo, and accent color so communications and report presentation stay consistent with your brand.",
    assetDir: "src/assets/support/company-info-and-branding-settings",
    type: "Everyone",
    steps: [
      {
        title: "Update Company Info",
        content:
          "Open Settings > Company Info and review your organization name, URL details, and default account information.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Company Info form in account settings"
        }
      },
      {
        title: "Update Logo and Branding",
        content:
          "Go to Settings > Logo and Branding to upload your logo and set an accent color that matches your style guide.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Logo and Branding settings with color selection"
        }
      },
      {
        title: "Save and verify",
        content:
          "Save changes, then confirm updates appear in your account experience and outgoing materials.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Saved branding changes reflected in account"
        }
      }
    ]
  },
  {
    slug: "email-signature-settings",
    title: "Settings: Email Signature",
    summary:
      "Set and maintain company and personal signatures for cleaner outbound communication.",
    intro:
      "Consistent signatures make your outreach look professional and reduce confusion when multiple team members send emails. This article explains how to manage both the company default signature and personal signature from the same settings area.",
    assetDir: "src/assets/support/email-signature-settings",
    type: "Everyone",
    steps: [
      {
        title: "Open Settings > Signature",
        content:
          "Go to the Signature tab in account settings to access signature controls.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Signature settings tab"
        }
      },
      {
        title: "Set company default signature",
        content:
          "Use the Company Default Signature option for standardized messaging used across the account.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Company Default Signature editor"
        }
      },
      {
        title: "Set personal signature",
        content:
          "Switch to Personal Signature to customize the signature for your own user profile.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Personal signature editor"
        }
      }
    ]
  },
  {
    slug: "reset-or-update-password",
    title: "Settings: Reset or Update Password",
    summary:
      "Use the Password tab to keep your login secure and recover quickly when credentials change.",
    intro:
      "Password updates are a routine part of account security. This guide shows where to access password settings and how to complete updates safely so you avoid lockouts and keep your account protected.",
    assetDir: "src/assets/support/reset-or-update-password",
    type: "Everyone",
    steps: [
      {
        title: "Open Settings > Password",
        content:
          "In Settings, choose Password to open your user password form.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Password tab in account settings"
        }
      },
      {
        title: "Enter your new credentials",
        content:
          "Enter your updated password details and submit the change.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Password update form"
        }
      },
      {
        title: "Confirm login works",
        content:
          "After updating, confirm your new password works and store it in your password manager.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Successful password update confirmation"
        }
      }
    ]
  },
  {
    slug: "broker-organizations-settings",
    title: "Settings: Broker Organizations",
    summary:
      "Manage your broker organization memberships and connection requests from one place.",
    intro:
      "If you work with broker organizations, this settings area helps you keep memberships accurate and current. You can search for organizations, request association, and remove old relationships when they no longer apply.",
    assetDir: "src/assets/support/broker-organizations-settings",
    type: "Everyone",
    steps: [
      {
        title: "Open Settings > Broker Organizations",
        content:
          "Go to Broker Organizations to see current memberships and pending actions.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Broker Organizations settings screen"
        }
      },
      {
        title: "Search and request membership",
        content:
          "Use Search Broker Organizations to find the right group, then submit a request for verification.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Search Broker Organizations form and request action"
        }
      },
      {
        title: "Maintain your organization list",
        content:
          "Review organizations you belong to and remove outdated associations when needed.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "List of broker organizations with remove action"
        }
      }
    ]
  },
  {
    slug: "trusted-franchisors-for-brokers",
    title: "Settings (Broker): Trusted Franchisors",
    summary:
      "Build and maintain your trusted franchisor list to speed up matching and referral workflows.",
    intro:
      "Trusted Franchisors helps brokers keep a short list of preferred franchisor relationships. Using this list can reduce repetitive setup during referrals and make sharing decisions faster. This article covers how to add, review, and remove entries.",
    assetDir: "src/assets/support/trusted-franchisors-for-brokers",
    type: "Broker",
    steps: [
      {
        title: "Open Settings > Trusted Franchisors",
        content:
          "Broker accounts can access the Trusted Franchisors tab directly from Settings.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Trusted Franchisors tab in broker settings"
        }
      },
      {
        title: "Add a franchisor",
        content:
          "Search and add franchisors you regularly work with so they are available in future workflows.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Add Trusted Franchisor workflow"
        }
      },
      {
        title: "Use and maintain the list",
        content:
          "Review your trusted list regularly and remove franchisors that are no longer active partners.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Trusted Franchisors list with remove action"
        }
      }
    ]
  },
  {
    slug: "referral-profile-for-franchisors",
    title: "Settings (Franchisor): Referral Profile",
    summary:
      "Set up your referral profile so brokers see accurate brand and qualification details when matching candidates.",
    intro:
      "Your referral profile is what brokers rely on to understand your concept, requirements, and contact path. Completing this section carefully improves lead quality and reduces back-and-forth during referrals. This walkthrough focuses on the fields that matter most for broker-facing clarity.",
    assetDir: "src/assets/support/referral-profile-for-franchisors",
    type: "Franchisor",
    steps: [
      {
        title: "Open Settings > Referrals",
        content:
          "Franchisor accounts can access the Referral Information tab from Settings.",
        media: {
          type: "screenshot",
          fileName: "01.png",
          alt: "Referral Information tab in franchisor settings"
        }
      },
      {
        title: "Complete referral contact details",
        content:
          "Fill in contact name, email, and phone so brokers know exactly who should receive qualified candidate inquiries.",
        media: {
          type: "screenshot",
          fileName: "02.png",
          alt: "Referral Contact Information fields"
        }
      },
      {
        title: "Update company profile and requirements",
        content:
          "Review company description, unit count, franchise start year, investment range, and business category to keep your profile accurate.",
        media: {
          type: "screenshot",
          fileName: "03.png",
          alt: "Company Profile and Franchising Requirements form"
        }
      },
      {
        title: "Save and review regularly",
        content:
          "Save your referral profile and revisit it any time your growth model, investment ranges, or contact ownership changes.",
        media: {
          type: "screenshot",
          fileName: "04.png",
          alt: "Saved referral profile confirmation"
        }
      }
    ]
  }
];