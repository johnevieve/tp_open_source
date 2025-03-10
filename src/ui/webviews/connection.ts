import GitInstance from '../../commandsGit/GitInstance';
import * as vscode from 'vscode';
import * as gitCommands from '../../commandsGit/gitCommands';

export async function renderConnection(repoPath: string): Promise<string> {
  try {
    let gitInstance: GitInstance | null = null;

    try {
      gitInstance = await GitInstance.getInstance(repoPath);
    } catch (error) {
      console.warn("⚠ Aucun dépôt Git détecté. Permettre la connexion avant initialisation.");
    }

    const isRepoInitialized = gitInstance ? gitInstance.getIsRepoInitialized() : false;
    let userName = '';
    let userEmail = '';

    try {
      userName = (gitInstance?.getUserInfo()?.name || await gitCommands.getGitUserName().catch(() => '')).trim();
      userEmail = (gitInstance?.getUserInfo()?.email || await gitCommands.getGitUserEmail().catch(() => '')).trim();
    } catch (error) {
      console.warn("⚠ Impossible de récupérer les informations utilisateur Git.", error);
    }

    return `
      <h2>Connexion & Dépôt</h2>

      <h3>⚙️ Configuration Git</h3>
      <label>Nom d'utilisateur :</label>
      <input type="text" id="gitUserName" value="${userName}" placeholder="Nom utilisateur">
      
      <label>Email :</label>
      <input type="email" id="gitUserEmail" value="${userEmail}" placeholder="Email">
      
      <button onclick="saveGitConfig()">Enregistrer</button>

      ${isRepoInitialized ? `
        <h3>📂 Informations sur le dépôt</h3>
        <label>URL du dépôt :</label>
        <input type="text" id="repoUrl" value="${repoPath}" readonly>
      ` : `
        <h3>🚀 Configurer un dépôt</h3>
        <button onclick="initRepo()">Initialiser un dépôt</button>

        <h3>📥 Cloner un dépôt</h3>
        <input type="text" id="repoUrl" placeholder="URL du dépôt">
        <button onclick="cloneRepo()">Cloner</button>
      `}

      <script>
        const vscode = acquireVsCodeApi();

        function saveGitConfig() {
          const name = document.getElementById('gitUserName').value;
          const email = document.getElementById('gitUserEmail').value;
          vscode.postMessage({ command: 'setGitUser', name, email });
        }

        function initRepo() {
          vscode.postMessage({ command: 'initRepo' });
        }

        function cloneRepo() {
          const url = document.getElementById('repoUrl').value;
          if (url) {
            vscode.postMessage({ command: 'cloneRepo', url });
          } else {
            alert("⚠ Veuillez entrer une URL pour cloner un dépôt.");
          }
        }
      </script>
    `;
  } catch (error) {
    console.error("⚠ Erreur lors du rendu de la connexion :", error);
    return `
      <h2>❌ Erreur</h2>
      <p>Impossible d'afficher la connexion.</p>
      <p>Vérifiez la console pour plus d'informations.</p>
    `;
  }
}
