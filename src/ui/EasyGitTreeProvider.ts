import * as vscode from 'vscode';
import GitInstance from '../commandsGit/GitInstance';

export class EasyGitTreeProvider implements vscode.TreeDataProvider<GitItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<GitItem | undefined | void> = new vscode.EventEmitter<GitItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<GitItem | undefined | void> = this._onDidChangeTreeData.event;
  private repoPath: string;

  constructor(private context: vscode.ExtensionContext, repoPath: string) {
    this.repoPath = repoPath;

    GitInstance.getInstance(repoPath).then(gitInstance => {
      if (gitInstance) {
        gitInstance.onDidChangeData(() => this._onDidChangeTreeData.fire());
      }
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  async getChildren(element?: GitItem): Promise<GitItem[]> {
    if (!this.repoPath) {
      return [
        new GitItem("Connexion & Dépôt", "account", "connection", "Configurer Git", "easygit.openWebview", "connection")
      ];
    }

    if (!element) {
      return [
        new GitItem("Accueil", "home", "home", "Vue d'accueil", "easygit.openWebview", "home"),
        new GitItem("Connexion & Dépôt", "account", "connection", "Configurer Git", "easygit.openWebview", "connection"),
        new GitItem("Branches & Commits", "source-control", "branches_root", "Gérer les branches et commits", "easygit.openWebview", "branches", vscode.TreeItemCollapsibleState.Collapsed),
      ];
    }

    if (element.contextValue === "branches_root") {
      return this.getBranches();
    }

    if (element.contextValue?.startsWith("branch_")) {
      if (typeof element.label === 'string') {
        return this.getCommits(element.label);
      }
      return [];
    }

    return [];
  }

  getTreeItem(element: GitItem): vscode.TreeItem {
    return element;
  }

  private async getBranches(): Promise<GitItem[]> {
    try {
      const gitInstance = await GitInstance.getInstance(this.repoPath);
      if (!gitInstance) return [];

      const branches = await gitInstance.getAllBranches();
      const currentBranch = await gitInstance.getCurrentBranch(); 

      return branches.map(branch => 
        new GitItem(
          `${branch.name === currentBranch ? "heads/" : ""}${branch.name}`,
          branch.isRemote ? "cloud" : "folder",
          `branch_${branch.name}`,
          `Ouvrir la branche ${branch.name}`,
          "easygit.openWebview",
          JSON.stringify({ section: "commits", branch: branch.name }),
          vscode.TreeItemCollapsibleState.Collapsed
        )
      );
    } catch (error) {
      console.error("⚠ Erreur lors de la récupération des branches :", error);
      return [];
    }
  }

  private async getCommits(branchName: string): Promise<GitItem[]> {
    try {
      const gitInstance = await GitInstance.getInstance(this.repoPath);
      if (!gitInstance) return [];

      const commits = await gitInstance.getBranchCommits(branchName);
      const localCommits = await gitInstance.getCommitHistory();

      return commits.map(commit => {
        const isLocal = localCommits.some(localCommit => localCommit.hash === commit.hash);
        return new GitItem(
          `${commit.hash.substring(0, 7)} - ${commit.message} ${isLocal ? "" : ""}`,
          "file",
          `commit_${commit.hash}`,
          `Voir le commit ${commit.hash}`,
          "easygit.openWebview",
          JSON.stringify({ section: "commit", commit: commit.hash }),
        );
      });
    } catch (error) {
      console.error(`⚠ Erreur lors de la récupération des commits pour la branche ${branchName}:`, error);
      return [];
    }
  }
}

class GitItem extends vscode.TreeItem {
  constructor(
    label: string,
    iconId: string,
    contextValue: string,
    tooltip: string,
    commandId?: string,
    commandArg?: string,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
  ) {
    super(label, collapsibleState);
    
    this.iconPath = new vscode.ThemeIcon(iconId);
    this.tooltip = tooltip;
    if (commandId && commandArg) {
      this.command = {
        command: commandId,
        title: label,
        arguments: [commandArg]
      };
    }
    this.contextValue = contextValue;
  }
}
