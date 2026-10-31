import { about } from "./about";
import { contact } from "./contact";
import { home } from "./home";
import { not_found } from "./not_found";
import { privacy } from "./privacy";
import { projects } from "./projects";
import { services } from "./services";
import { shared } from "./shared";
import type { Defaults, PageKey } from "./types";

export const DEFAULTS: Defaults = { shared, home, projects, services, about, contact, privacy, not_found };

export const PAGE_KEYS: PageKey[] = ["shared", "home", "projects", "services", "about", "contact", "privacy", "not_found"];

export type {
  AboutCopy,
  ContactCopy,
  Defaults,
  HeroCopy,
  HomeCopy,
  LinkCopy,
  NotFoundCopy,
  PageKey,
  PrivacyCopy,
  ProjectsCopy,
  SectionCopy,
  ServicesCopy,
  SharedCopy,
} from "./types";
