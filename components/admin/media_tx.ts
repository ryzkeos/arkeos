import * as db from "@/lib/db";

type Tx = { uploaded: Set<string>; released: Set<string> };

const scopes = new Map<string, Tx>();

const path_of = (url: string) => url.split("?")[0];

const tx_for = (scope: string): Tx => {
  let tx = scopes.get(scope);
  if (!tx) {
    tx = { uploaded: new Set(), released: new Set() };
    scopes.set(scope, tx);
  }
  return tx;
};

export async function media_backup(scope: string, url: string) {
  if (url && !tx_for(scope).uploaded.has(url)) await db.dbBackupFile(url);
}

export function media_uploaded(scope: string, next: string, previous: string) {
  const tx = tx_for(scope);
  tx.uploaded.add(next);
  if (previous && path_of(previous) !== path_of(next)) tx.released.add(previous);
}

export function media_released(scope: string, url: string) {
  if (!url) return;
  const tx = tx_for(scope);
  if (!tx.uploaded.has(url)) {
    db.dbBackupFile(url);
    tx.released.add(url);
    return;
  }
  tx.uploaded.delete(url);
  if ([...tx.released].some((r) => path_of(r) === path_of(url))) tx.released.add(url);
  else db.dbDeleteFile(url);
}

export function media_commit(scope: string, keep: string[] = []) {
  const tx = scopes.get(scope);
  if (!tx) return;
  scopes.delete(scope);
  const kept = new Set([...keep, ...tx.uploaded].map(path_of));
  tx.released.forEach((url) => {
    if (!kept.has(path_of(url))) db.dbDeleteFile(url);
  });
}

export function media_discard(scope: string) {
  const tx = scopes.get(scope);
  if (!tx) return;
  scopes.delete(scope);
  const old = new Set([...tx.released].map(path_of));
  tx.uploaded.forEach((url) => {
    if (!old.has(path_of(url))) db.dbDeleteFile(url);
  });
}
