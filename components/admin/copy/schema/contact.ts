import type { CopyField } from "../copy_schema";

export const contact_schema: CopyField[] = [
  { path: "hero.eyebrow", label: "Hero: small label", type: "text", max: 60 },
  { path: "hero.lines", label: "Hero title lines (separate lines with |, max 3)", type: "lines", max: 40 },
  { path: "hero.sub", label: "Hero: subtitle", type: "textarea", max: 240 },
  { path: "hero.ghost", label: "Hero: large background word", type: "text", max: 24 },
  { path: "hero.cta.label", label: "Hero button label (empty hides the button)", type: "text", max: 40 },
  { path: "hero.cta.href", label: "Hero button link", type: "text", max: 300 },

  { path: "info.title", label: "Info: title", type: "text", max: 60 },
  { path: "info.body", label: "Info: text", type: "textarea", max: 400 },
  { path: "info.email_label", label: "Info: email label", type: "text", max: 40 },
  { path: "info.response_label", label: "Info: response time label", type: "text", max: 40 },

  { path: "form.name_label", label: "Form: name label", type: "text", max: 40 },
  { path: "form.name_placeholder", label: "Form: name placeholder", type: "text", max: 60 },
  { path: "form.email_label", label: "Form: email label", type: "text", max: 40 },
  { path: "form.email_placeholder", label: "Form: email placeholder", type: "text", max: 60 },
  { path: "form.type_label", label: "Form: project type label", type: "text", max: 40 },
  { path: "form.type_placeholder", label: "Form: project type placeholder", type: "text", max: 60 },
  { path: "form.project_types", label: "Form: project type options", type: "list", max: 60 },
  { path: "form.budget_label", label: "Form: budget label", type: "text", max: 40 },
  { path: "form.budget_placeholder", label: "Form: budget placeholder", type: "text", max: 60 },
  { path: "form.budget_ranges", label: "Form: budget options", type: "list", max: 60 },
  { path: "form.timeline_label", label: "Form: timeline label", type: "text", max: 40 },
  { path: "form.timeline_placeholder", label: "Form: timeline placeholder", type: "text", max: 60 },
  { path: "form.timelines", label: "Form: timeline options", type: "list", max: 60 },
  { path: "form.message_label", label: "Form: message label", type: "text", max: 60 },
  { path: "form.message_placeholder", label: "Form: message placeholder", type: "textarea", max: 240 },
  { path: "form.submit_label", label: "Form: send button", type: "text", max: 40 },
  { path: "form.sending_label", label: "Form: sending button text", type: "text", max: 40 },
  { path: "form.select_close_label", label: "Form: close label on the option picker", type: "text", max: 40 },
  { path: "form.note", label: "Form: note beside the button (empty uses the response time)", type: "text", max: 120 },

  { path: "success.title", label: "Success: title", type: "text", max: 60 },
  { path: "success.body", label: "Success: text", type: "textarea", max: 300 },
  { path: "success.back_label", label: "Success: button", type: "text", max: 40 },

  { path: "errors.required", label: "Error: missing fields", type: "text", max: 160 },
  { path: "errors.invalid_email", label: "Error: invalid email", type: "text", max: 160 },
  { path: "errors.network", label: "Error: network", type: "text", max: 160 },
  { path: "errors.server", label: "Error: server", type: "text", max: 160 },
];
