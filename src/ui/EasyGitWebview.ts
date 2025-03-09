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

  public static async showWebview(context: vscode.ExtensionContext, section: string) {
    const repoPath = vscode.workspace.rootPath || '';

    if (EasyGitWebview.panel) {
      EasyGitWebview.panel.webview.html = await EasyGitWebview.getWebviewContent(section, repoPath);
      EasyGitWebview.panel.reveal(vscode.ViewColumn.One);
    } else {
      EasyGitWebview.panel = vscode.window.createWebviewPanel(
        'easyGitWebview',
        'EasyGit UI',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      EasyGitWebview.panel.webview.html = await EasyGitWebview.getWebviewContent(section, repoPath);

      EasyGitWebview.panel.webview.onDidReceiveMessage(async (message) => {
        const gitInstance = GitInstance.getInstance(repoPath);

        switch (message.command) {
            case 'setGitUser':
                await gitCommands.setGitUserName(message.name);
                await gitCommands.setGitUserEmail(message.email);
                await (await gitInstance).updateUserInfo();
                vscode.window.showInformationMessage("Nom et email Git mis à jour !");
                break;
    
            case 'initRepo':
                await gitCommands.initRepo(repoPath);
                await (await gitInstance).updateAll();
                vscode.window.showInformationMessage("Dépôt Git initialisé !");
                vscode.commands.executeCommand('easygit.refreshTree'); // 🔄 Rafraîchir le panneau latéral
                EasyGitWebview.panel!.webview.html = await EasyGitWebview.getWebviewContent('connection', repoPath);
                break;
    
            case 'cloneRepo':
                if (message.url) {
                    await gitCommands.cloneRepo(repoPath, message.url);
                    await (await gitInstance).updateAll();
                    vscode.window.showInformationMessage("Dépôt cloné !");
                    vscode.commands.executeCommand('easygit.refreshTree'); // 🔄 Rafraîchir le panneau latéral
                    EasyGitWebview.panel!.webview.html = await EasyGitWebview.getWebviewContent('connection', repoPath);
                }
                break;
        }
      });
    

      EasyGitWebview.panel.onDidDispose(() => {
        EasyGitWebview.panel = null;
      });
    }
  }

  private static async getWebviewContent(section: string, repoPath: string): Promise<string> {
    let content = await EasyGitWebview.getSectionContent(section, repoPath);
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EasyGit UI</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
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

  private static async getSectionContent(section: string, repoPath: string): Promise<string> {
    switch (section) {
      case "home": return renderHome();
      case "connection": return await renderConnection(repoPath);
      case "branches": return renderBranches();
      case "commit": return renderCommit();
      case "commits": return renderCommits();
      case "conflicts": return renderConflicts();
      case "actions": return renderActions();
      default: return `<h2>Bienvenue sur EasyGit</h2><p>Sélectionnez une section à gauche.</p>`;
    }
  }
}

