import * as vscode from 'vscode';
import { getGitUserName, setGitUserName } from './commandsGit/gitCommands';

import { EasyGitWebview } from './ui/EasyGitWebview';
import { EasyGitTreeProvider } from './ui/EasyGitTreeProvider';
import GitInstance from './commandsGit/GitInstance';

export async function activate(context: vscode.ExtensionContext) {
  console.log("EasyGit activé !");

  const repoPath = vscode.workspace.rootPath || '';
  const gitInstance = GitInstance.getInstance(repoPath);
  await gitInstance.update(); 

  const easyGitTreeProvider = new EasyGitTreeProvider(context);
  vscode.window.registerTreeDataProvider("easygitTree", easyGitTreeProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand("easygit.refreshTree", async () => {
      await gitInstance.update();
      easyGitTreeProvider.refresh();
    }),
    
    vscode.commands.registerCommand("easygit.openWebview", (section: string) => {
      if (!section) section = "home";
      EasyGitWebview.showWebview(context, section);
    })
  );
}

