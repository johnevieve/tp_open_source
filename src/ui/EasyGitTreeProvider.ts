import * as vscode from 'vscode';
import { EasyGitWebview } from './EasyGitWebview';

export class EasyGitTreeProvider implements vscode.TreeDataProvider<GitItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<GitItem | undefined | void> = new vscode.EventEmitter<GitItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<GitItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getChildren(element?: GitItem): Thenable<GitItem[]> {
    if (!element) {
      return Promise.resolve([
        new GitItem("Accueil", "home", "home", "Accueil", "easygit.openWebview", "home"),
        new GitItem("Branches", "git-branch", "branches", "Gestion des branches", "easygit.openWebview", "branches"),
        new GitItem("Commits", "git-commit", "commits", "Liste des commits récents", "easygit.openWebview", "commits"),
        new GitItem("Gestion Locale", "files", "local", "Modifier/Supprimer fichiers locaux", "easygit.openWebview", "local"),
        new GitItem("Conflits", "warning", "conflicts", "Résoudre les conflits avant un merge", "easygit.openWebview", "conflicts"),
        new GitItem("Stash", "archive", "stash", "Gérer le stash (sauvegarde temporaire)", "easygit.openWebview", "stash"),
      ]);
    }
    return Promise.resolve([]);
  }

  getTreeItem(element: GitItem): vscode.TreeItem {
    return element;
  }
}

class GitItem extends vscode.TreeItem {
  constructor(
    label: string,
    iconId: string,
    contextValue: string,
    tooltip: string,
    commandId: string,
    commandArg: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    
    this.iconPath = new vscode.ThemeIcon(iconId);

    this.tooltip = tooltip;

    this.command = {
      command: commandId,
      title: label,
      arguments: [commandArg]
    };

    this.contextValue = contextValue;
  }
}
