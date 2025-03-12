import { runGitCommand } from './gitExecutor';

/**
 * Liste toutes les branches locales.
 */
export async function listBranches(repoPath: string): Promise<Array<{ name: string, current: boolean }>> {
  const result = await runGitCommand(`branch`, repoPath);
  return result.split('\n').map(line => {
      const current = line.startsWith('*');
      return { name: line.replace('*', '').trim(), current };
  });
}

/**
* Crée une nouvelle branche.
*/
export async function createBranch(repoPath: string, branchName: string): Promise<string> {
  return runGitCommand(`branch ${branchName}`, repoPath);
}

/**
* Change de branche.
*/
export async function switchBranch(repoPath: string, branchName: string): Promise<string> {
  return runGitCommand(`checkout ${branchName}`, repoPath);
}

/**
* Fusionne une branche locale.
*/
export async function mergeBranch(repoPath: string, branchName: string): Promise<string> {
  return runGitCommand(`merge ${branchName}`, repoPath);
}

/**
* Fusionne une branche distante.
*/
export async function mergeRemoteBranch(repoPath: string, remoteRepo: string, branchName: string): Promise<string> {
  return runGitCommand(`merge ${remoteRepo}/${branchName}`, repoPath);
}

/**
* Supprime une branche locale.
*/
export async function deleteBranch(repoPath: string, branchName: string): Promise<string> {
  return runGitCommand(`branch -d ${branchName}`, repoPath);
}

/**
 * Récupère toutes les branches (locales et distantes) et marque la branche actuelle (HEAD).
 */
export async function getAllBranches(repoPath: string): Promise<Array<{ name: string; isRemote: boolean; current: boolean }>> {
  try {
    const localBranches = await runGitCommand(`branch --format="%(refname:short)"`, repoPath);
    const remoteBranches = await runGitCommand(`branch -r --format="%(refname:short)"`, repoPath);
    const currentBranch = await getCurrentBranch(repoPath); // Récupère le HEAD

    return [
      ...localBranches.split("\n").map(branch => ({
        name: branch.trim(),
        isRemote: false,
        current: branch.trim() === currentBranch, // Vérifie si c'est la branche active
      })),
      ...remoteBranches.split("\n").map(branch => ({
        name: branch.trim(),
        isRemote: true,
        current: false, // Les branches distantes ne peuvent pas être HEAD localement
      })),
    ];
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des branches :", error);
    return [];
  }
}

/**
 * Récupère la branche actuelle (HEAD).
 */
export async function getCurrentBranch(repoPath: string): Promise<string> {
  try {
    return await runGitCommand(`rev-parse --abbrev-ref HEAD`, repoPath);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du HEAD :", error);
    return "unknown";
  }
}

