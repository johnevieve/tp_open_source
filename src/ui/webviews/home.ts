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
    <ul>
      ${branches?.map(branch => `<li>${branch.current ? '🔹' : '🔸'} ${branch.name}</li>`).join('')}
    </ul>

    <h3>📌 Commits récents</h3>
    <ul>
      ${commitHistory?.slice(0, 5).map(commit => `
        <li>
          <b>${commit.message}</b> - ${commit.author} (${commit.date})
        </li>`).join('')}
    </ul>

    <button onclick="refreshHome()">Rafraîchir</button>

    <script>
      function updateUserInfo() {
        const name = document.getElementById("userName").value;
        const email = document.getElementById("userEmail").value;
        vscode.postMessage({ command: "setGitUser", name, email });
      }

      function refreshHome() {
        vscode.postMessage({ command: "refreshHome" });
      }
    </script>
  `;
}
