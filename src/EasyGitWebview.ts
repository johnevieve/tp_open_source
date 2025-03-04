import * as vscode from 'vscode';

export class EasyGitWebview {
  public static showWebview(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
      'easyGitWebview',
      'EasyGit UI',
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    panel.webview.html = EasyGitWebview.getWebviewContent();
  }

  private static getWebviewContent(): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EasyGit UI</title>
        <script>
          function showMessage() {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ command: 'alert', text: 'Interface en cours de développement' });
          }
        </script>
      </head>
      <body>
        <h1>Bienvenue sur EasyGit</h1>
        <button onclick="showMessage()">Tester le bouton</button>
      </body>
      </html>
    `;
  }
}
