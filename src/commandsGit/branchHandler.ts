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
