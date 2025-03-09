import * as vscode from 'vscode';
import { EasyGitWebview } from './ui/EasyGitWebview';
import { EasyGitTreeProvider } from './ui/EasyGitTreeProvider';
import * as remoteHandler from './commandsGit/remoteHandler';
import GitInstance from './commandsGit/GitInstance';
import * as gitCommands from './commandsGit/gitCommands';

export async function activate(context: vscode.ExtensionContext) {
  console.log("EasyGit activé !");

  let repoPath = vscode.workspace.rootPath || '';
  let gitInstance: GitInstance | null = null;
  let commitButton: vscode.StatusBarItem, pushButton: vscode.StatusBarItem, pullButton: vscode.StatusBarItem;
  let easyGitTreeProvider: EasyGitTreeProvider;

  async function updateGitState() {
    if (gitInstance) {
        repoPath = gitInstance.getRepoPath();
    }

    console.log("🔍 Vérification du dépôt Git à :", repoPath);
    const isGitInitialized = await checkGitConnection(repoPath);

    if (isGitInitialized) {
        gitInstance = await GitInstance.getInstance(repoPath);
        repoPath = gitInstance.getRepoPath()
        if (gitInstance) {
            await gitInstance.updateAll();
        }
    } else {
        console.log("❌ Aucun dépôt Git détecté !");
    }

    toggleStatusBarButtons(isGitInitialized);
    refreshPanel(isGitInitialized);
    return isGitInitialized;
}

  function createStatusBarButtons() {
    commitButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    commitButton.text = "$(check) Commit";
    commitButton.tooltip = "Faire un commit";
    commitButton.command = "easygit.openWebview";
    context.subscriptions.push(commitButton);

    pushButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    pushButton.text = "$(cloud-upload) Push";
    pushButton.tooltip = "Pousser les modifications";
    pushButton.command = "easygit.executeGitAction.push";
    context.subscriptions.push(pushButton);

    pullButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
    pullButton.text = "$(cloud-download) Pull";
    pullButton.tooltip = "Récupérer les dernières modifications";
    pullButton.command = "easygit.executeGitAction.pull";
    context.subscriptions.push(pullButton);
  }

  function toggleStatusBarButtons(isGitInitialized: boolean) {
    if (isGitInitialized) {
      commitButton.show();
      pushButton.show();
      pullButton.show();
    } else {
      commitButton.hide();
      pushButton.hide();
      pullButton.hide();
    }
  }

  function refreshPanel(isGitInitialized: boolean) {
    easyGitTreeProvider = new EasyGitTreeProvider(context, isGitInitialized ? repoPath : '');
    vscode.window.registerTreeDataProvider("easygitTree", easyGitTreeProvider);
    easyGitTreeProvider.refresh();
  }

  createStatusBarButtons();
  let isGitInitialized = await updateGitState();
  refreshPanel(isGitInitialized);

  context.subscriptions.push(
    vscode.commands.registerCommand("easygit.refreshTree", async () => {
      isGitInitialized = await updateGitState();
      if (!gitInstance || !isGitInitialized) {
        vscode.window.showWarningMessage("Aucun dépôt Git détecté.");
        return;
      }
      easyGitTreeProvider.refresh();
    }),

    vscode.commands.registerCommand("easygit.openWebview", (section: string) => {
      section = isGitInitialized ? "commit" : "connection";
      EasyGitWebview.showWebview(context, section);
    }),

    vscode.commands.registerCommand("easygit.executeGitAction.push", async () => {
      if (!isGitInitialized) {
        vscode.window.showErrorMessage("Aucun dépôt Git configuré.");
        return;
      }
      await remoteHandler.pushToRemote(repoPath);
      if (gitInstance) await gitInstance.updateAll();
      vscode.window.showInformationMessage("Push effectué avec succès.");
    }),

    vscode.commands.registerCommand("easygit.executeGitAction.pull", async () => {
      if (!isGitInitialized) {
        vscode.window.showErrorMessage("Aucun dépôt Git configuré.");
        return;
      }
      await remoteHandler.pullRemote(repoPath);
      if (gitInstance) await gitInstance.updateAll();
      vscode.window.showInformationMessage("Pull effectué avec succès.");
    }),

    vscode.commands.registerCommand("easygit.initRepository", async () => {
      const targetPath = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        openLabel: "Sélectionner un dossier pour initialiser Git"
      });

      if (targetPath && targetPath[0]) {
        const folderPath = targetPath[0].fsPath;
        try {
          await gitCommands.initRepo(folderPath);
          vscode.window.showInformationMessage("Dépôt Git initialisé avec succès.");
          repoPath = folderPath;
          isGitInitialized = await updateGitState();
          refreshPanel(isGitInitialized);
        } catch (error) {
          vscode.window.showErrorMessage("Erreur lors de l'initialisation du dépôt.");
        }
      }
    }),

    vscode.commands.registerCommand("easygit.cloneRepository", async () => {
      const repoUrl = await vscode.window.showInputBox({ prompt: "Entrez l'URL du dépôt à cloner" });
      if (repoUrl) {
          const targetPath = await vscode.window.showOpenDialog({
              canSelectFolders: true,
              openLabel: "Sélectionner un dossier pour cloner"
          });
  
          if (targetPath && targetPath[0]) {
              const folderPath = targetPath[0].fsPath;
              try {
                  vscode.window.showInformationMessage("Clonage du dépôt en cours...");
                  console.log(`Clonage de ${repoUrl} dans ${folderPath}`);
  
                  await gitCommands.cloneRepo(folderPath, repoUrl);
  
                  console.log("📂 Vérification du chemin du dépôt après clonage...");
                  const fs = require('fs');
                  const path = require('path');
                  const repoName = repoUrl.split('/').pop()?.replace('.git', '');
                  let clonedRepoPath = path.join(folderPath, repoName);
  
                  // Vérifier si Git a bien créé un `.git`
                  if (!fs.existsSync(path.join(clonedRepoPath, '.git'))) {
                      clonedRepoPath = folderPath;
                  }
  
                  repoPath = clonedRepoPath;
                  gitInstance = await GitInstance.getInstance(repoPath);
                  repoPath = gitInstance.getRepoPath(); // 🔄 Mise à jour après récupération
  
                  console.log(`✅ Dépôt cloné et détecté dans : ${repoPath}`);
  
                  console.log("🔄 Mise à jour de l'état Git...");
                  isGitInitialized = await updateGitState();
  
                  if (isGitInitialized) {
                      console.log("✅ Détection Git réussie !");
                      refreshPanel(isGitInitialized);
                  } else {
                      console.error("❌ Échec de la détection Git !");
                      vscode.window.showErrorMessage("Le dépôt cloné n'a pas été détecté comme un dépôt Git.");
                  }
  
              } catch (error) {
                  vscode.window.showErrorMessage("Erreur lors du clonage du dépôt.");
                  console.error("Erreur lors du clonage:", error);
          }
        }
      }
    }),
  );
}

async function checkGitConnection(repoPath: string): Promise<boolean> {
  const fs = require('fs');
  const path = require('path');

  if (fs.existsSync(path.join(repoPath, '.git'))) {
      return await gitCommands.isGitRepository(repoPath);
  }

  const possibleRepoPath = path.join(repoPath, path.basename(repoPath));
  if (fs.existsSync(path.join(possibleRepoPath, '.git'))) {
      return await gitCommands.isGitRepository(possibleRepoPath);
  }
  return false;
}
