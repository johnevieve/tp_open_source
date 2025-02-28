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
        new GitItem("Ouvrir l'interface", vscode.TreeItemCollapsibleState.None, {
          command: "easygit.openWebview",
          title: "Ouvrir"
        }),
        new GitItem("Branches", vscode.TreeItemCollapsibleState.Collapsed),
        new GitItem("Commits", vscode.TreeItemCollapsibleState.Collapsed),
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
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    if (command) {
      this.command = command;
    }
  }
}
