import GitInstance from '../../commandsGit/GitInstance';
import * as vscode from 'vscode';

export function renderHome(): string {
  const gitInstance = GitInstance.getInstance(vscode.workspace.rootPath || "");
  
  
  const userInfo = gitInstance.getUserInfo();
  const repoStatus = gitInstance.getRepoStatus();
  const branches = gitInstance.getBranches();
  const commitHistory = gitInstance.getCommitHistory();

  return `
    <h2>Accueil</h2>

    <h3>👤 Informations utilisateur</h3>
    <p>Nom : <input type="text" id="userName" value="${userInfo?.name || ''}" /></p>
    <p>Email : <input type="text" id="userEmail" value="${userInfo?.email || ''}" /></p>
    <button onclick="updateUserInfo()">Mettre à jour</button>

    <h3>📌 Statut du Dépôt</h3>
    <pre>${repoStatus || 'Aucun statut disponible'}</pre>

    <h3>🌿 Branches</h3>
    <ul>
      ${branches.map(branch => `<li>${branch.current ? '🔹' : '🔸'} ${branch.name}</li>`).join('')}
    </ul>

    <h3>📌 Commits récents</h3>
    <ul>
      ${commitHistory.slice(0, 5).map(commit => `
        <li>
          <b>${commit.message}</b> - ${commit.author} (${commit.date})
        </li>`).join('')}
    </ul>

    <button onclick="refreshHome()">Rafraîchir</button>

    <script>
        
    </script>
  `;
}