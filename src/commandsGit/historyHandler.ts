import { runGitCommand } from './gitExecutor';

/**
 * Récupère l'historique des commits du dépôt.
 */
export async function getGitLog(repoPath: string): Promise<Array<{ hash: string, author: string, date: string, message: string }>> {
  const logFormat = '--pretty=format:"%h|%an|%ad|%s" --date=short';
  const result = await runGitCommand(`log ${logFormat}`, repoPath);
  
  return result.split('\n').map(line => {
      const [hash, author, date, message] = line.replace(/"/g, '').split('|');
      return { hash, author, date, message };
  });
}

/**
 * Récupère l'historique d'un fichier spécifique avec `git log --follow`.
 */
export async function getGitFileHistory(repoPath: string, filePath: string): Promise<Array<{ hash: string, author: string, date: string, message: string }>> {
  const logFormat = '--pretty=format:"%h|%an|%ad|%s" --date=short';
  const result = await runGitCommand(`log --follow ${logFormat} -- "${filePath}"`, repoPath);

  return result.split('\n').map(line => {
      const [hash, author, date, message] = line.replace(/"/g, '').split('|');
      return { hash, author, date, message };
  });
}

/**
 * Compare deux branches et retourne les différences.
 */
export async function getGitDiff(repoPath: string, branch1: string, branch2: string): Promise<string> {
  return runGitCommand(`diff ${branch1}...${branch2}`, repoPath);
}

/**
 * Affiche le contenu d'un commit spécifique.
 */
export async function getGitShowCommit(repoPath: string, commitHash: string): Promise<string> {
  return runGitCommand(`show ${commitHash}`, repoPath);
}

/**
 * Réinitialise un dépôt à un commit donné.
 * @param hard Si `true`, effectue un `git reset --hard`, sinon un `git reset`.
 */
export async function gitReset(repoPath: string, commitHash: string, hard: boolean = false): Promise<string> {
  return runGitCommand(`reset ${hard ? '--hard' : ''} ${commitHash}`, repoPath);
}

/**
 * Récupère l'historique des commits d'une branche spécifique.
 */
export async function getBranchCommits(repoPath: string, branchName: string): Promise<Array<{ hash: string, author: string, date: string, message: string }>> {
  const logFormat = '--pretty=format:"%h|%an|%ad|%s" --date=short';
  const result = await runGitCommand(`log ${branchName} ${logFormat}`, repoPath);

  return result.split('\n').map(line => {
    const [hash, author, date, message] = line.replace(/"/g, '').split('|');
    return { hash, author, date, message };
  });
}

