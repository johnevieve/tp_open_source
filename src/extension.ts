import * as vscode from 'vscode';
import { getGitUserName, setGitUserName } from './commandsGit/gitCommands';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "easyGit" is now active!');

	const disposableTestUserName = vscode.commands.registerCommand('easyGit.testUserName', async () => {
        try {
            // Étape 1: Récupérer le nom actuel
            const currentName = await getGitUserName();
            vscode.window.showInformationMessage(`Nom Git actuel: ${currentName}`);

            // Étape 2: Changer le nom temporairement
            await setGitUserName("test");
            vscode.window.showInformationMessage(`Nom temporaire défini: test`);

            // Pause de 3 secondes avant de revenir au nom normal
            setTimeout(async () => {
                await setGitUserName("Genevieve Trudel");
                vscode.window.showInformationMessage(`Nom Git restauré: Genevieve Trudel`);
            }, 3000);
        } catch (error) {
            vscode.window.showErrorMessage(`Erreur : ${error}`);
        }
    });

	context.subscriptions.push(disposableTestUserName);
}

export function deactivate() {}
