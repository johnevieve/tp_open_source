import { runGitCommand } from './gitExecutor';

/**
 * Récupère les dernières modifications d'un dépôt distant sans les fusionner.
 */
export async function fetchRemote(repoPath: string, remoteName: string = 'origin'): Promise<string> {
  return runGitCommand(`fetch ${remoteName}`, repoPath);
}

/**
 * Récupère les modifications et fusionne avec la branche actuelle (`git pull`).
 */
export async function pullRemote(repoPath: string, remoteName: string = 'origin', branch: string = 'main'): Promise<string> {
  return runGitCommand(`pull ${remoteName} ${branch}`, repoPath);
}

/**
 * Envoie les modifications vers le dépôt distant (`git push`).
 */
export async function pushToRemote(repoPath: string, remoteName: string = 'origin', branch: string = 'main'): Promise<string> {
  return runGitCommand(`push ${remoteName} ${branch}`, repoPath);
}
