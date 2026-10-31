import type { ContactCopy } from "./types";

export const contact: ContactCopy = {
  hero: { eyebrow: "", lines: [], sub: "", ghost: "", cta: null },
  info: { title: "", body: "", email_label: "", response_label: "" },
  form: {
    name_label: "",
    name_placeholder: "",
    email_label: "",
    email_placeholder: "",
    type_label: "",
    type_placeholder: "",
    project_types: [],
    budget_label: "",
    budget_placeholder: "",
    budget_ranges: [],
    timeline_label: "",
    timeline_placeholder: "",
    timelines: [],
    message_label: "",
    message_placeholder: "",
    submit_label: "",
    sending_label: "",
    note: "",
  },
  success: { title: "", body: "", back_label: "" },
  errors: { required: "", invalid_email: "", network: "", server: "" },
};
