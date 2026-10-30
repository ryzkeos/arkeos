import type { Project } from "./types";
import { loadProjects } from "./content";

export {
  dbGet as sbGet,
  dbInsert as sbPost,
  dbUpdate as sbPatch,
  dbDelete as sbDelete,
  dbCount as sbCount,
  dbSignIn as sbSignIn,
  dbSignOut as sbSignOut,
  dbSetSession as sbSetSession,
  dbRestoreSession as sbRestoreSession,
  dbIsAuthed as sbIsAuthed,
  dbUpload as sbUpload,
  dbPublicUrl as sbPublicUrl,
  dbLoadSiteSettings as sbLoadSiteSettings,
  dbSaveSetting as sbSaveSetting,
  dbTrackPageView as sbTrackPageView,
  dbSubmitInquiry as sbSubmitInquiry,
  dbGetInquiries as sbGetInquiries,
  dbMarkInquiry as sbMarkInquiry,
  dbDeleteInquiry as sbDeleteInquiry,
  dbGetProjects as sbGetProjects,
  dbSaveProject as sbSaveProject,
  dbDeleteProject as sbDeleteProject,
  dbGetServices as sbGetServices,
  dbSaveService as sbSaveService,
  dbDeleteService as sbDeleteService,
} from "./db";

export const sbLoadProjects = (_fallback?: Project[]) => loadProjects();
