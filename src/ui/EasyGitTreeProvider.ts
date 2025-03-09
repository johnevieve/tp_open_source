import * as vscode from 'vscode';

export class EasyGitTreeProvider implements vscode.TreeDataProvider<GitItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<GitItem | undefined | void> = new vscode.EventEmitter<GitItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<GitItem | undefined | void> = this._onDidChangeTreeData.event;
  private repoPath: string;

  constructor(private context: vscode.ExtensionContext, repoPath: string) {
    this.repoPath = repoPath;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getChildren(element?: GitItem): Thenable<GitItem[]> {
    if (!element) {
      if (!this.repoPath) {
        return Promise.resolve([
          new GitItem("Connexion & Dépôt", "account", "connection", "Configurer Git", "easygit.openWebview", "connection")
        ]);
      }
      return Promise.resolve([
        new GitItem("Accueil", "home", "home", "Vue d'accueil", "easygit.openWebview", "home"),
        new GitItem("Connexion & Dépôt", "account", "connection", "Configurer Git", "easygit.openWebview", "connection"), 
        new GitItem("Branches & Commits", "source-control", "branches", "Gérer les branches et commits", "easygit.openWebview", "branches"),
        new GitItem("Résolution de Conflits", "git-pull-request", "conflicts", "Aide pour résoudre les conflits", "easygit.openWebview", "conflicts"),
        
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
