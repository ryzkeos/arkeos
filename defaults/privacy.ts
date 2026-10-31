import type { PrivacyCopy } from "./types";

export const privacy: PrivacyCopy = {
  label: "Legal",
  title: "PRIVACY POLICY",
  updated_label: "Last updated:",
  sections: [
    {
      heading: "Overview",
      paragraphs: [
        "This page explains what personal data this website collects and how it is handled. {name} is the owner of this website.",
      ],
    },
    {
      heading: "Inquiry form",
      paragraphs: [
        "When you send an inquiry through the contact form, the following details are stored: name, email address, project type, budget range, timeline and your message.",
        "This data is used to read and answer your inquiry.",
      ],
    },
    {
      heading: "Page views",
      paragraphs: [
        "When a page is opened, the site records the page path and the time of the visit in an analytics table. This record is not linked to your name or email address.",
      ],
    },
    {
      heading: "Where data is stored",
      paragraphs: [
        "Inquiries and page view records are stored in the studio's hosted database. Access is limited to the studio through its admin panel.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "This website follows the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines. Under this law you may ask to see the personal data we hold about you, ask us to correct it, ask us to delete or block it, object to its processing, and withdraw your consent. You may also file a complaint with the National Privacy Commission.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: ["To make a request about your data, contact the studio:"],
    },
  ],
};
