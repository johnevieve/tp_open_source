import * as vscode from 'vscode';
import GitInstance from '../commandsGit/GitInstance';

export class EasyGitWebview {
  private static panel: vscode.WebviewPanel | null = null;

  public static showWebview(context: vscode.ExtensionContext, section: string) {
    if (EasyGitWebview.panel) {
      // Si le panneau est déjà ouvert, on met à jour le contenu
      EasyGitWebview.panel.webview.html = EasyGitWebview.getWebviewContent(section);
      EasyGitWebview.panel.reveal(vscode.ViewColumn.One);
    } else {
      // Sinon, on crée un nouveau panneau et on stocke la référence
      EasyGitWebview.panel = vscode.window.createWebviewPanel(
        'easyGitWebview',
        'EasyGit UI',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      EasyGitWebview.panel.webview.html = EasyGitWebview.getWebviewContent(section);

      // Nettoyer la référence lorsque le panneau est fermé
      EasyGitWebview.panel.onDidDispose(() => {
        EasyGitWebview.panel = null;
      });
    }
  }

  private static getWebviewContent(section: string): string {
    let content = "<h2>Bienvenue sur EasyGit</h2>";

    switch (section) {
      case "home":
        content += "<p>Statut du dépôt et résumé des actions.</p>";
        break;
      case "branches":
        content += "<p>Gestion des branches.</p>";
        break;
      case "commits":
        content += "<p>Liste des commits récents.</p>";
        break;
      case "local":
        content += "<p>Modifier/Supprimer les fichiers locaux sans perte.</p>";
        break;
      case "conflicts":
        content += "<p>Gestion des conflits avant un merge.</p>";
        break;
      case "stash":
        content += "<p>Gérer le stash (enregistrer/récupérer des changements).</p>";
        break;
      default:
        content += "<p>Sélectionnez une section à gauche.</p>";
        break;
    }

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EasyGit UI</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #007acc; }
        </style>
      </head>
      <body>
        <h1>${section.toUpperCase()}</h1>
        ${content}
      </body>
      </html>
    `;
  }
}
