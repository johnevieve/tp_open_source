import { runGitCommand } from './gitExecutor';

/**
 * Stocke temporairement les modifications en attente dans le stash (`git stash`).
 */
export async function stashChanges(repoPath: string): Promise<string> {
  try {
      return await runGitCommand(`stash`, repoPath);
  } catch (error) {
      throw new Error(`Échec du stash : ${error}`);
  }
}

/**
 * Récupère les modifications du stash et les applique (`git stash pop`).
 */
export async function popStash(repoPath: string): Promise<string> {
  try {
      return await runGitCommand(`stash pop`, repoPath);
  } catch (error) {
      throw new Error(`Échec du pop stash : ${error}`);
  }
}

/**
 * Liste les éléments du stash (`git stash list`).
 */
export async function listStash(repoPath: string): Promise<Array<{ index: string, message: string }>> {
  try {
      const result = await runGitCommand(`stash list`, repoPath);
      
      return result.split('\n').filter(line => line).map(line => {
          const match = line.match(/^stash@{(\d+)}:\s(.+)$/);
          if (match) {
              return { index: `stash@{${match[1]}}`, message: match[2] };
          }
          return null;
      }).filter(item => item !== null) as Array<{ index: string, message: string }>;
  } catch (error) {
      throw new Error(`Échec de la récupération de la liste des stashes : ${error}`);
  }
}

/**
 * Supprime le stash le plus récent (`git stash drop`).
 */
export async function dropLatestStash(repoPath: string): Promise<string> {
  try {
      return await runGitCommand(`stash drop`, repoPath);
  } catch (error) {
      throw new Error(`Échec de la suppression du dernier stash : ${error}`);
  }
}

/**
 * Supprime un stash spécifique (`git stash drop stash@{n}`).
 */
export async function dropStash(repoPath: string, stashIndex: string): Promise<string> {
  try {
      return await runGitCommand(`stash drop ${stashIndex}`, repoPath);
  } catch (error) {
      throw new Error(`Échec de la suppression du stash ${stashIndex} : ${error}`);
  }
}