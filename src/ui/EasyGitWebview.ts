import * as vscode from 'vscode';
import GitInstance from '../commandsGit/GitInstance';
import { renderHome } from './webviews/home';
import { renderCommits } from './webviews/commits';
import { renderConflicts } from './webviews/conflicts';
import { renderConnection } from './webviews/connection';
import { renderBranches } from './webviews/branches';
import { renderActions } from './webviews/actions';
import { renderCommit } from './webviews/commit';
import * as gitCommands from '../commandsGit/gitCommands';

export class EasyGitWebview {
  private static panel: vscode.WebviewPanel | null = null;

  public static async showWebview(context: vscode.ExtensionContext, section: string, extraData: any = {}) {
    const repoPath = vscode.workspace.rootPath || '';
    vscode.commands.executeCommand('easygit.refreshTree');

    if (EasyGitWebview.panel) {
      await EasyGitWebview.updateWebview(section, repoPath, extraData);
    } else {
      EasyGitWebview.panel = vscode.window.createWebviewPanel(
        'easyGitWebview',
        EasyGitWebview.getWebviewTitle(section),
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      await EasyGitWebview.updateWebview(section, repoPath, extraData);
      EasyGitWebview.panel.onDidDispose(() => {
        EasyGitWebview.panel = null;
      });

      EasyGitWebview.panel.webview.onDidReceiveMessage(async (message) => {
        await EasyGitWebview.handleMessage(message, repoPath);
      });
    }
  }

  private static async handleMessage(message: any, repoPath: string) {
    try {
      const gitInstance = await GitInstance.getInstance(repoPath);
      if (!gitInstance) {
        vscode.window.showErrorMessage("❌ Impossible d'accéder au dépôt Git.");
        return;
      }

      switch (message.command) {
        case 'setGitUser':
          await gitCommands.setGitUserName(message.name);
          await gitCommands.setGitUserEmail(message.email);
          await gitInstance.updateUserInfo();
          vscode.window.showInformationMessage("✅ Nom et email Git mis à jour !");
          break;

        case 'initRepo':
          await gitCommands.initRepo(repoPath);
          await gitInstance.updateAll();
          vscode.window.showInformationMessage("✅ Dépôt Git initialisé !");
          vscode.commands.executeCommand('easygit.refreshTree');
          await EasyGitWebview.updateWebview('connection', repoPath);
          break;

        case 'cloneRepo':
          if (message.url) {
            await gitCommands.cloneRepo(repoPath, message.url);
            await gitInstance.updateAll();
            vscode.window.showInformationMessage("✅ Dépôt cloné !");
            vscode.commands.executeCommand('easygit.refreshTree');
            await EasyGitWebview.updateWebview('connection', repoPath);
          }
          break;

        default:
          console.warn(`⚠ Commande inconnue reçue: ${message.command}`);
      }
    } catch (error) {
      vscode.window.showErrorMessage("❌ Erreur lors de l'exécution de la commande Git.");
      console.error("⚠ Erreur Webview Message Handling:", error);
    }
  }

  private static async updateWebview(section: string, repoPath: string, extraData: any = {}) {
    if (!EasyGitWebview.panel) return;
    vscode.commands.executeCommand('easygit.refreshTree');

    try {
      EasyGitWebview.panel.title = EasyGitWebview.getWebviewTitle(section);
      EasyGitWebview.panel.webview.html = await EasyGitWebview.getWebviewContent(section, repoPath, extraData);
    } catch (error) {
      console.error(`⚠ Erreur lors de la mise à jour de la Webview (${section}):`, error);
      EasyGitWebview.panel.webview.html = `
        <h2>Erreur</h2>
        <p>Impossible de charger la section <b>${section}</b>. Vérifiez la console pour plus d'informations.</p>
      `;
    }
  }

  private static getWebviewTitle(section: string): string {
    const titles: { [key: string]: string } = {
      home: "Accueil",
      connection: "Connexion",
      branches: "Branches",
      commit: "Commit",
      commits: "Commits",
      conflicts: "Conflits",
      actions: "Actions"
    };
    return titles[section] || "EasyGit";
  }

  private static async getSectionContent(section: string, repoPath: string, extraData: any = {}): Promise<string> {
    try {
      switch (section) {
        case "home": return renderHome();
        case "connection": return await renderConnection(repoPath);
        case "branches": return renderBranches();
        case "commit": return renderCommit(extraData);
        case "commits": return renderCommits(extraData);
        case "conflicts": return renderConflicts();
        case "actions": return renderActions();
        default: return `<h2>Bienvenue sur EasyGit</h2><p>Sélectionnez une section à gauche.</p>`;
      }
    } catch (error) {
      console.error(`⚠ Erreur lors du rendu de la section "${section}" :`, error);
      return `
        <h2>Erreur</h2>
        <p>Impossible de charger la section <b>${section}</b>. Vérifiez la console pour plus d'informations.</p>
      `;
    }
  }

  private static async getWebviewContent(section: string, repoPath: string, extraData: any): Promise<string> {
    const content = await EasyGitWebview.getSectionContent(section, repoPath, extraData);
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${EasyGitWebview.getWebviewTitle(section)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .container { max-width: 800px; margin: auto; }
          .error { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          ${content}
        </div>
      </body>
      </html>
    `;
  }
}
