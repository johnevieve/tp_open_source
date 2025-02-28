import * as vscode from 'vscode';

import { EasyGitWebview } from './EasyGitWebview';
import { EasyGitTreeProvider } from './EasyGitTreeProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log("EasyGit activé !");

  const easyGitTreeProvider = new EasyGitTreeProvider(context);
  vscode.window.registerTreeDataProvider("easygitTree", easyGitTreeProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand("easygit.refreshTree", () => {
      easyGitTreeProvider.refresh();
    }),
    vscode.commands.registerCommand("easygit.openWebview", () => {
      EasyGitWebview.showWebview(context);
    })
  );
}

