import type { ContactCopy } from "./types";

export const contact: ContactCopy = {
  hero: {
    eyebrow: "Start a Project",
    lines: ["LET'S", "TALK."],
    sub: "Fill in the brief below and tell us what you are building.",
    ghost: "CONTACT",
    cta: null,
  },
  info: {
    title: "TELL US EVERYTHING.",
    body: "The more context you give us, the better the conversation we can have. Share the scope, budget and timeline.",
    email_label: "Email",
    response_label: "Response Time",
  },
  form: {
    name_label: "Your Name",
    name_placeholder: "Full name",
    email_label: "Email Address",
    email_placeholder: "your@email.com",
    type_label: "Project Type",
    type_placeholder: "Select a type",
    project_types: ["Web Development", "Motion Design", "Interactive Experience", "Branding System", "Other"],
    budget_label: "Budget Range",
    budget_placeholder: "Select a range",
    budget_ranges: ["Under $1,000", "$1,000 to $5,000", "$5,000 to $10,000", "$10,000 and above"],
    timeline_label: "Timeline",
    timeline_placeholder: "When do you need this?",
    timelines: ["ASAP", "Within 1 month", "Within 3 months", "Flexible"],
    message_label: "Tell Us About the Project",
    message_placeholder: "What are you building? What is the goal? What is not working today? Share as much as you can.",
    submit_label: "Send Inquiry",
    sending_label: "Sending...",
    select_close_label: "Close",
    note: "",
  },
  success: {
    title: "INQUIRY RECEIVED.",
    body: "Thank you. We have received your brief and will be in touch.",
    back_label: "Back to Home",
  },
  errors: {
    required: "Please fill in all fields before submitting.",
    invalid_email: "Please enter a valid email address.",
    network: "Network error. Please check your connection and try again.",
    server: "Something went wrong. Please try again later.",
  },
};
