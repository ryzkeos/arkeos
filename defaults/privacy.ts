import type { PrivacyCopy } from "./types";

export const privacy: PrivacyCopy = {
  label: "Legal",
  title: "PRIVACY POLICY",
  updated_label: "Last Updated:",
  sections: [
    {
      heading: "Overview",
      paragraphs: [
        "This page explains what personal data this website collects and how it is handled. {name} is the owner of this website.",
      ],
    },
    {
      heading: "Inquiry Form",
      paragraphs: [
        "When You Send an Inquiry Through the Contact Form, the Following Details Are Stored: Name, Email Address, Project Type, Budget Range, Timeline and Your Message.",
        "This Data Is Used to Read and Answer Your Inquiry.",
      ],
    },
    {
      heading: "Page Views",
      paragraphs: [
        "When a page is opened, the site records the page path and the time of the visit in an analytics table. This record is not linked to your name or email address.",
      ],
    },
    {
      heading: "Where Data Is Stored",
      paragraphs: [
        "Inquiries and page view records are stored in the studio's hosted database. Access is limited to the studio through its admin panel.",
      ],
    },
    {
      heading: "Your Rights",
      paragraphs: [
        "This website follows the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines. Under this law you may ask to see the personal data we hold about you, ask us to correct it, ask us to delete or block it, object to its processing, and withdraw your consent. You may also file a complaint with the National Privacy Commission.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: ["To Make a Request About Your Data, Contact the Studio:"],
    },
  ],
};
