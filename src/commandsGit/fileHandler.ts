import { runGitCommand } from './gitExecutor';

/**
 * Supprime un fichier du projet et de Git.
 */
export async function removeFile(repoPath: string, filePath: string): Promise<string> {
  return runGitCommand(`rm ${filePath}`, repoPath);
}

/**
 * Retire un fichier de l'index Git sans le supprimer du disque.
 */
export async function removeFileFromIndex(repoPath: string, filePath: string): Promise<string> {
  return runGitCommand(`rm --cached ${filePath}`, repoPath);
}

/**
 * Renomme ou déplace un fichier dans Git.
 */
export async function moveFile(repoPath: string, oldPath: string, newPath: string): Promise<string> {
  return runGitCommand(`mv ${oldPath} ${newPath}`, repoPath);
}

/**
 * Récupère les modifications non indexées (`git diff`).
 */
export async function getUnstagedDiff(repoPath: string): Promise<string> {
  return runGitCommand(`diff`, repoPath);
}

/**
 * Récupère les modifications indexées (`git diff --staged`).
 */
export async function getStagedDiff(repoPath: string): Promise<string> {
  return runGitCommand(`diff --staged`, repoPath);
}

/**
 * Liste les fichiers non suivis et ignorés (`git ls-files --other --ignored --exclude-standard`).
 */
export async function listUntrackedIgnoredFiles(repoPath: string): Promise<string[]> {
  const result = await runGitCommand(`ls-files --other --ignored --exclude-standard`, repoPath);
  return result ? result.split('\n') : [];
}