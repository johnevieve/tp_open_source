import GitInstance from '../../commandsGit/GitInstance';
import * as vscode from 'vscode';
import * as gitCommands from '../../commandsGit/gitCommands';

export async function renderConnection(repoPath: string): Promise<string> {
  const gitInstance = GitInstance.getInstance(repoPath);
  await (await gitInstance).updateUserInfo();  
  
  const userInfo = (await gitInstance).getUserInfo();
  const isRepoInitialized = (await gitInstance).getIsRepoInitialized();
  
  const userName = userInfo?.name || await gitCommands.getGitUserName().catch(() => '');
  const userEmail = userInfo?.email || await gitCommands.getGitUserEmail().catch(() => '');


  return `
    <h2>Connexion & Dépôt</h2>
    <p>${isRepoInitialized ? 'Votre dépôt Git est bien configuré.' : 'Aucun dépôt Git détecté.'}</p>

    <label>Nom d'utilisateur :</label>
    <input type="text" id="gitUserName" value="${userName.trim()}" placeholder="Nom utilisateur">
    
    <label>Email :</label>
    <input type="email" id="gitUserEmail" value="${userEmail.trim()}" placeholder="Email">

    <button onclick="saveGitConfig()">Enregistrer</button>

    ${isRepoInitialized ? `
      <h3>Informations sur le dépôt</h3>
      <label>URL du dépôt :</label>
      <input type="text" id="repoUrl" value="${repoPath}" readonly>
    ` : `
      <h3>Configurer un dépôt</h3>
      <button onclick="initRepo()">Initialiser un dépôt</button>

      <h3>Cloner un dépôt</h3>
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
          alert("Veuillez entrer une URL pour cloner un dépôt.");
        }
      }
    </script>
  `;
}
