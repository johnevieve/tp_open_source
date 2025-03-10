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
  let easyGitTreeProvider: EasyGitTreeProvider;
  let isGitInitialized = false;

  const commitButton = createStatusBarButton("$(check) Commit", "Faire un commit", "easygit.openWebview");
  const pushButton = createStatusBarButton("$(cloud-upload) Push", "Pousser les modifications", "easygit.executeGitAction.push");
  const pullButton = createStatusBarButton("$(cloud-download) Pull", "Récupérer les dernières modifications", "easygit.executeGitAction.pull");

  async function updateGitState() {
    try {
      isGitInitialized = await checkGitConnection(repoPath);
      if (isGitInitialized) {
        gitInstance = await GitInstance.getInstance(repoPath);
        if (gitInstance) {
          repoPath = gitInstance.getRepoPath();
          await gitInstance.updateAll();
        }
      } else {
        console.warn("❌ Aucun dépôt Git détecté !");
        gitInstance = null;
      }

      toggleStatusBarButtons();
      refreshPanel();
    } catch (error) {
      console.error("⚠ Erreur lors de la mise à jour du GitState :", error);
    }
  }

  function createStatusBarButton(text: string, tooltip: string, command: string): vscode.StatusBarItem {
    const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    button.text = text;
    button.tooltip = tooltip;
    button.command = command;
    context.subscriptions.push(button);
    return button;
  }

  function toggleStatusBarButtons() {
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

  function refreshPanel() {
    easyGitTreeProvider = new EasyGitTreeProvider(context, isGitInitialized ? repoPath : '');
    vscode.window.registerTreeDataProvider("easygitTree", easyGitTreeProvider);
    easyGitTreeProvider.refresh();
  }

  await updateGitState();

  context.subscriptions.push(
    vscode.commands.registerCommand("easygit.refreshTree", async () => {
      if (!isGitInitialized) {
        vscode.window.showWarningMessage("⚠ Aucun dépôt Git détecté.");
        return;
      }
      easyGitTreeProvider.refresh();
    }),

    vscode.commands.registerCommand("easygit.openWebview", (section: string = "home") => {
      if (!isGitInitialized) {
        section = "connection";
      }
      EasyGitWebview.showWebview(context, section);
    }),

    vscode.commands.registerCommand("easygit.executeGitAction.push", async () => {
      if (!isGitInitialized) {
        return vscode.window.showErrorMessage("⚠ Aucun dépôt Git configuré.");
      }
      try {
        await remoteHandler.pushToRemote(repoPath);
        await updateGitState();
        vscode.window.showInformationMessage("✅ Push effectué avec succès.");
      } catch (error) {
        vscode.window.showErrorMessage("❌ Erreur lors du Push.");
        console.error("⚠ Erreur Push :", error);
      }
    }),

    vscode.commands.registerCommand("easygit.executeGitAction.pull", async () => {
      if (!isGitInitialized) {
        return vscode.window.showErrorMessage("⚠ Aucun dépôt Git configuré.");
      }
      try {
        await remoteHandler.pullRemote(repoPath);
        await updateGitState();
        vscode.window.showInformationMessage("✅ Pull effectué avec succès.");
      } catch (error) {
        vscode.window.showErrorMessage("❌ Erreur lors du Pull.");
        console.error("⚠ Erreur Pull :", error);
      }
    }),


    vscode.commands.registerCommand("easygit.initRepository", async () => {
      const targetPath = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        openLabel: "Sélectionner un dossier pour initialiser Git"
      });

      if (targetPath?.[0]) {
        const folderPath = targetPath[0].fsPath;
        try {
          await gitCommands.initRepo(folderPath);
          vscode.window.showInformationMessage("✅ Dépôt Git initialisé avec succès.");
          repoPath = folderPath;
          await updateGitState();
        } catch (error) {
          vscode.window.showErrorMessage("❌ Erreur lors de l'initialisation du dépôt.");
          console.error("⚠ Erreur Init Repo :", error);
        }
      }
    }),

    vscode.commands.registerCommand("easygit.cloneRepository", async () => {
      const repoUrl = await vscode.window.showInputBox({ prompt: "Entrez l'URL du dépôt à cloner" });
      if (!repoUrl) return;

      const targetPath = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        openLabel: "Sélectionner un dossier pour cloner"
      });

      if (!targetPath?.[0]) return;

      const folderPath = targetPath[0].fsPath;
      try {
        vscode.window.showInformationMessage("📥 Clonage du dépôt en cours...");
        await gitCommands.cloneRepo(folderPath, repoUrl);

        const fs = require('fs');
        const path = require('path');
        const repoName = repoUrl.split('/').pop()?.replace('.git', '');
        let clonedRepoPath = path.join(folderPath, repoName);

        if (!fs.existsSync(path.join(clonedRepoPath, '.git'))) {
          clonedRepoPath = folderPath;
        }

        repoPath = clonedRepoPath;
        gitInstance = await GitInstance.getInstance(repoPath);

        if (gitInstance) {
          repoPath = gitInstance.getRepoPath();
        }

        await updateGitState();

        if (isGitInitialized) {
          vscode.window.showInformationMessage("✅ Dépôt cloné avec succès !");
        } else {
          vscode.window.showErrorMessage("❌ Le dépôt cloné n'a pas été détecté comme un dépôt Git.");
          console.error("⚠ Échec de la détection Git après clonage.");
        }
      } catch (error) {
        vscode.window.showErrorMessage("❌ Erreur lors du clonage du dépôt.");
        console.error("⚠ Erreur Clonage :", error);
      }
    }),
  );
}

async function checkGitConnection(repoPath: string): Promise<boolean> {
  repoPath = GitInstance.findGitRepoPath(repoPath);
  const fs = require('fs');
  const path = require('path');

  if (fs.existsSync(path.join(repoPath, '.git'))) {
      return await gitCommands.isGitRepository(repoPath);
  }

  return false;
}

