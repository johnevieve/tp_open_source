import GitInstance from '../../commandsGit/GitInstance';
import * as vscode from 'vscode';

export async function renderHome(): Promise<string> {
  const gitInstance = await GitInstance.getInstance(vscode.workspace.rootPath || "");

  const userInfo = gitInstance?.getUserInfo();
  const repoStatus = gitInstance?.getRepoStatus();
  const branches = gitInstance?.getBranches();
  const commitHistory = gitInstance?.getCommitHistory();

  return `
    <h2>Accueil</h2>
    <h3>📌 Statut du Dépôt</h3>
    <pre>${repoStatus || 'Aucun statut disponible'}</pre>

    <h3>🌿 Branches</h3>

    <h3>📌 Commits récents</h3>
    <ul>
      ${commitHistory?.slice(0, 5).map(commit => `
        <li>
          <b>${commit.message}</b> - ${commit.author} (${commit.date})
        </li>`).join('')}
    </ul>

    <script>
    </script>
  `;
}
